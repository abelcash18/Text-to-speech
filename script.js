document.addEventListener('DOMContentLoaded', () => {
  const synth = window.speechSynthesis;

  // DOM Elements
  const textArea = document.getElementById('textArea');
  const speakBtn = document.getElementById('speakBtn');
  const stopBtn = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput = document.getElementById('rate');
  const pitchInput = document.getElementById('pitch');
  const rateValue = document.getElementById('rateValue');
  const pitchValue = document.getElementById('pitchValue');

  let voices = [];

  // Populate native browser voices dynamically
  const populateVoiceList = () => {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    if (voices.length === 0) {
      voiceSelect.innerHTML = '<option disabled>No voices available</option>';
      return;
    }

    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-lang', voice.lang);
      option.setAttribute('data-name', voice.name);
      
      // Default to an English voice or the first available
      if (voice.default || voice.lang.startsWith('en')) {
        option.selected = true;
      }

      voiceSelect.appendChild(option);
    });
  };

  populateVoiceList();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  // Update slider displays
  rateInput.addEventListener('input', () => rateValue.textContent = rateInput.value);
  pitchInput.addEventListener('input', () => pitchValue.textContent = pitchInput.value);

  // Speak Functionality
  const speak = () => {
    // If actively speaking, stop previous instance
    if (synth.speaking) {
      synth.cancel();
    }

    const text = textArea.value.trim();

    if (!text) {
      alert('Please enter some text to speak!');
      return;
    }

    const utterThis = new SpeechSynthesisUtterance(text);

    // Selected Voice setup
    const selectedOption = voiceSelect.selectedOptions[0]?.getAttribute('data-name');
    const selectedVoice = voices.find(v => v.name === selectedOption);
    if (selectedVoice) {
      utterThis.voice = selectedVoice;
    }

    // Rate and Pitch
    utterThis.rate = parseFloat(rateInput.value);
    utterThis.pitch = parseFloat(pitchInput.value);

    // UI state handlers during speech
    utterThis.onstart = () => {
      speakBtn.disabled = true;
      stopBtn.disabled = false;
      speakBtn.textContent = 'Speaking...';
    };

    utterThis.onend = utterThis.onerror = () => {
      speakBtn.disabled = false;
      stopBtn.disabled = true;
      speakBtn.textContent = 'Speak Text';
    };

    synth.speak(utterThis);
  };

  // Event Listeners
  speakBtn.addEventListener('click', speak);

  stopBtn.addEventListener('click', () => {
    if (synth.speaking) {
      synth.cancel();
    }
  });
});