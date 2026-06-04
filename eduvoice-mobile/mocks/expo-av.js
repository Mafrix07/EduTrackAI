// Web stub for expo-av — audio recording not available on web
export const Audio = {
  requestPermissionsAsync: async () => ({ status: "denied" }),
  setAudioModeAsync: async () => {},
  Recording: {
    createAsync: async () => { throw new Error("Audio not available on web"); },
  },
  RecordingOptionsPresets: { HIGH_QUALITY: {} },
};
export const Video = {};
export const AVPlaybackStatus = {};
