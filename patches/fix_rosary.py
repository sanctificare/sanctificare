f = open(r"c:\Users\ferra\Sanctificare\client\src\pages\RosaryGuided.tsx", "r", encoding="utf-8")
content = f.read()
f.close()

# The bad block starts with the broken showAudio + AudioPlayer and the nested preload JSX
BAD_START = '        {showAudio && (\n          <div className="mt-5 animate-fade-in">\n            <AudioPlayer\n          {/* Pr'
BAD_END_AFTER = '        )}\n      </section>'

idx_start = content.find(BAD_START)
idx_end = content.find(BAD_END_AFTER, idx_start)

print("start:", idx_start, "end:", idx_end)
if idx_start < 0 or idx_end < 0:
    print("NOT FOUND")
    exit(1)

# Include the full bad block up to (but not including) </section>
bad_block = content[idx_start:idx_end + len('        )}')]

print("---BAD BLOCK---")
print(bad_block)
print("---END BAD BLOCK---")

good_block = """        {/* Pré-carrega a próxima faixa enquanto a atual toca, para transição sem gap */}
        {autoRosaryActive && currentAudioTrack + 1 < rosaryAudioTracks.length && (
          <audio
            key={`preload-${currentAudioTrack + 1}`}
            src={rosaryAudioTracks[currentAudioTrack + 1].audioUrl}
            preload="auto"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        )}

        {showAudio && (
          <div className="mt-5 animate-fade-in">
            <AudioPlayer
              audioUrl={rosaryAudioTracks[currentAudioTrack].audioUrl}
              title={rosaryAudioTracks[currentAudioTrack].title}
              description={rosaryAudioTracks[currentAudioTrack].description}
              artworkUrl={getAudioArtworkUrl(currentAudioTrack)}
              supportTitle={audioSupport.supportTitle}
              supportDescription={audioSupport.supportDescription}
              supportText={audioSupport.supportText}
              autoPlay={autoRosaryActive}
              onTrackEnd={handleAudioTrackEnd}
              onTrackError={handleAudioTrackError}
            />
          </div>
        )}"""

new_content = content[:idx_start] + good_block + content[idx_start + len(bad_block):]

f = open(r"c:\Users\ferra\Sanctificare\client\src\pages\RosaryGuided.tsx", "w", encoding="utf-8")
f.write(new_content)
f.close()
print("DONE")
