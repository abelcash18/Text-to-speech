document.addEventListener('DOMContentLoaded', () => {
  const synth = window.speechSynthesis;
  const isSupported = 'speechSynthesis' in window;
  const textArea = document.getElementById('textArea');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput = document.getElementById('rate');
  const pitchInput = document.getElementById('pitch');
  const rateValue = document.getElementById('rateValue');
  const pitchValue = document.getElementById('pitchValue');
  const charCount = document.getElementById('charCount');
  const speakBtn = document.getElementById('speakBtn');
  const stopBtn = document.getElementById('stopBtn');
  const clearBtn = document.getElementById('clearBtn');
  const playbackStatus = document.getElementById('playbackStatus');
  let voices = [];

  const setStatus = (message, playing = false) => {
    playbackStatus.textContent = message;
    playbackStatus.classList.toggle('is-playing', playing);
  };
  const setPlaying = (playing) => {
    speakBtn.disabled = playing;
    stopBtn.disabled = !playing;
    speakBtn.querySelector('span').textContent = playing ? 'Playing…' : 'Play voice';
  };
  const populateVoiceList = () => {
    if (!isSupported) {
      voiceSelect.replaceChildren(new Option('Speech is unavailable in this browser', ''));
      voiceSelect.disabled = true;
      speakBtn.disabled = true;
      setStatus('Speech synthesis is not supported in this browser');
      return;
    }
    const previousVoice = voiceSelect.value;
    voices = synth.getVoices();
    voiceSelect.replaceChildren();
    if (!voices.length) {
      voiceSelect.add(new Option('No voices available in this browser', ''));
      voiceSelect.disabled = true;
      return;
    }
    voices.forEach((voice) => {
      const option = new Option(`${voice.name} — ${voice.lang}`, voice.name);
      option.selected = voice.name === previousVoice || (!previousVoice && (voice.default || voice.lang.startsWith('en')));
      voiceSelect.add(option);
    });
    voiceSelect.disabled = false;
  };
  const updateTextMeta = () => {
    charCount.textContent = `${textArea.value.length.toLocaleString()} / 5,000`;
    clearBtn.disabled = !textArea.value.length;
  };
  const speak = () => {
    const text = textArea.value.trim();
    if (!text) { textArea.focus(); setStatus('Add some text to begin'); return; }
    if (!isSupported) { setStatus('Speech synthesis is not supported in this browser'); return; }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find((voice) => voice.name === voiceSelect.value) || null;
    utterance.rate = Number(rateInput.value);
    utterance.pitch = Number(pitchInput.value);
    utterance.onstart = () => { setPlaying(true); setStatus('Playing your voice', true); };
    utterance.onend = () => { setPlaying(false); setStatus('Finished playing'); };
    utterance.onerror = (event) => {
      setPlaying(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') setStatus('Playback could not start — please try again');
    };
    synth.speak(utterance);
  };

  textArea.addEventListener('input', updateTextMeta);
  rateInput.addEventListener('input', () => { rateValue.textContent = `${Number(rateInput.value).toFixed(1)}×`; });
  pitchInput.addEventListener('input', () => { pitchValue.textContent = Number(pitchInput.value).toFixed(1); });
  clearBtn.addEventListener('click', () => { textArea.value = ''; updateTextMeta(); textArea.focus(); setStatus('Ready when you are'); });
  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', () => { synth.cancel(); setPlaying(false); setStatus('Playback stopped'); });
  window.addEventListener('beforeunload', () => synth?.cancel());
  populateVoiceList();
  if (isSupported && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = populateVoiceList;
  updateTextMeta();
});
