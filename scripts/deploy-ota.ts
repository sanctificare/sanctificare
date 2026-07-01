import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { ZipArchive } from "archiver";

// Carrega as variáveis de ambiente do arquivo .env no diretório atual
dotenv.config();

// Ignora erros de verificação de TLS/SSL caso o ambiente do desenvolvedor use certificados corporativos ou interceptadores
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Erro: Variáveis do Cloudflare R2 não configuradas no arquivo .env.");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.join(rootDir, "dist", "public");
const tempZipPath = path.join(rootDir, "dist", "ota-bundle.zip");

// Função para empacotar em ZIP
function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    archive.pipe(stream);
    archive.directory(sourceDir, false);

    archive.on("error", (err) => reject(err));
    stream.on("close", () => resolve());
    archive.finalize();
  });
}

async function main() {
  try {
    // 1. Obter a versão do package.json
    console.log("Lendo versão do package.json...");
    const pkgPath = path.join(rootDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    
    // O ID da build do Capacitor Updater precisa ser uma string única.
    // Usamos o formato: <version>-<timestamp>
    const version = `${pkg.version}-${Date.now()}`;
    console.log(`Versão gerada para o release OTA: ${version}`);

    // 2. Rodar a compilação do projeto web
    console.log("Compilando o projeto (pnpm build)...");
    execSync("pnpm build", { cwd: rootDir, stdio: "inherit" });

    if (!fs.existsSync(buildDir)) {
      throw new Error(`Pasta de build não encontrada em: ${buildDir}`);
    }

    // 3. Compactar a pasta dist/public
    console.log(`Gerando pacote ZIP a partir de: ${buildDir}`);
    await zipDirectory(buildDir, tempZipPath);
    console.log(`Arquivo ZIP temporário criado em: ${tempZipPath}`);

    // 4. Configurar cliente S3 para o R2
    console.log("Conectando ao Cloudflare R2...");
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    // 5. Upload do arquivo ZIP
    const zipKey = `ota/bundle-${version}.zip`;
    console.log(`Fazendo upload do ZIP para: ${zipKey}...`);
    const zipData = fs.readFileSync(tempZipPath);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: zipKey,
        Body: zipData,
        ContentType: "application/zip",
      })
    );

    const fileUrl = `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${zipKey}`;
    console.log(`Upload do ZIP concluído. URL: ${fileUrl}`);

    // 6. Upload do arquivo live-update.json com os novos metadados
    const metadataKey = "live-update.json";
    const metadata = {
      version,
      url: fileUrl,
    };
    console.log("Atualizando o arquivo live-update.json no Cloudflare R2...");
    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: metadataKey,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: "application/json",
        CacheControl: "no-store, no-cache, must-revalidate, proxy-revalidate",
      })
    );

    console.log("Atualização de metadados concluída com sucesso!");
    console.log(`Nova versão disponível publicamente: ${version}`);

  } catch (error) {
    console.error("Erro durante o processo de deploy OTA:", error);
    process.exit(1);
  } finally {
    // Limpar o ZIP temporário
    if (fs.existsSync(tempZipPath)) {
      console.log("Limpando arquivos temporários...");
      fs.unlinkSync(tempZipPath);
    }
  }
}

main();
