export const Audio = {
  requestPermissionsAsync: async () => ({ status: "denied" }),
  setAudioModeAsync: async () => {},
  Recording: {
    createAsync: async () => { throw new Error("Audio not available on web"); },
  },
  RecordingOptionsPresets: { HIGH_QUALITY: {} },
};
