$accountId = "5e71a04d57bd48684a8f4d75dc7b780e"
$accessKey = "31abf6abdb2b3ffdeaf88a09ca631c89"
$secretKey = "ebf5b63878bc8c2fc011bf320aaec0256806ad41c778542e9f1562fd01173645"
$bucket = "musica-sacra"
$endpoint = "https://$accountId.r2.cloudflarestorage.com"
$region = "auto"
$service = "s3"

$now = [System.DateTime]::UtcNow
$dateStr = $now.ToString("yyyyMMdd")
$datetimeStr = $now.ToString("yyyyMMddTHHmmssZ")

$method = "GET"
$canonicalUri = "/$bucket"
$canonicalQueryString = ""
$hostHeader = "$accountId.r2.cloudflarestorage.com"

$canonicalHeaders = "host:$hostHeader`nx-amz-date:$datetimeStr`n"
$signedHeaders = "host;x-amz-date"

# Empty body hash
$emptyHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

$canonicalRequest = "$method`n$canonicalUri`n$canonicalQueryString`n$canonicalHeaders`n$signedHeaders`n$emptyHash"

# Hash the canonical request
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$canonicalRequestHash = [System.BitConverter]::ToString(
    $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($canonicalRequest))
).Replace("-","").ToLower()

$credentialScope = "$dateStr/$region/$service/aws4_request"
$stringToSign = "AWS4-HMAC-SHA256`n$datetimeStr`n$credentialScope`n$canonicalRequestHash"

# HMAC helper
function HmacSHA256([byte[]]$key, [string]$data) {
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $key
    return $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($data))
}

$kSecret  = [System.Text.Encoding]::UTF8.GetBytes("AWS4$secretKey")
$kDate    = HmacSHA256 $kSecret $dateStr
$kRegion  = HmacSHA256 $kDate $region
$kService = HmacSHA256 $kRegion $service
$kSigning = HmacSHA256 $kService "aws4_request"

$signature = [System.BitConverter]::ToString(
    (New-Object System.Security.Cryptography.HMACSHA256 -Property @{Key=$kSigning}).ComputeHash(
        [System.Text.Encoding]::UTF8.GetBytes($stringToSign)
    )
).Replace("-","").ToLower()

$authHeader = "AWS4-HMAC-SHA256 Credential=$accessKey/$credentialScope, SignedHeaders=$signedHeaders, Signature=$signature"

$headers = @{
    "Authorization" = $authHeader
    "x-amz-date"   = $datetimeStr
}

$url = "$endpoint/$bucket"
Write-Host "Fetching: $url"

$response = Invoke-WebRequest -Uri $url -Headers $headers -Method GET -UseBasicParsing
Write-Host $response.Content
