document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 3D CANVAS BACKGROUND (Three.js)
  // ==========================================
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create 3D Floating Particle Ring (TorusKnot)
  const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
  const particlesGeometry = new THREE.BufferGeometry();
  const count = geometry.attributes.position.count;

  particlesGeometry.setAttribute('position', geometry.attributes.position);

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xa855f7,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  camera.position.z = 25;

  // Mouse interaction effect
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 0.5;
  });

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    particlesMesh.rotation.x += 0.003;
    particlesMesh.rotation.y += 0.005;

    // Smooth subtle camera drift on mouse movement
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };

  animate();

  // Responsive Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ==========================================
  // SPEECH SYNTHESIS LOGIC
  // ==========================================
  const synth = window.speechSynthesis;
  const textArea = document.getElementById('textArea');
  const speakBtn = document.getElementById('speakBtn');
  const stopBtn = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput = document.getElementById('rate');
  const pitchInput = document.getElementById('pitch');
  const rateValue = document.getElementById('rateValue');
  const pitchValue = document.getElementById('pitchValue');

  let voices = [];

  const populateVoiceList = () => {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    if (voices.length === 0) {
      voiceSelect.innerHTML = '<option disabled>No voices available</option>';
      return;
    }

    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute('data-name', voice.name);
      
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

  rateInput.addEventListener('input', () => rateValue.textContent = rateInput.value);
  pitchInput.addEventListener('input', () => pitchValue.textContent = pitchInput.value);

  const speak = () => {
    if (synth.speaking) synth.cancel();

    const text = textArea.value.trim();
    if (!text) {
      alert('Please enter some text to speak!');
      return;
    }

    const utterThis = new SpeechSynthesisUtterance(text);
    const selectedOption = voiceSelect.selectedOptions[0]?.getAttribute('data-name');
    const selectedVoice = voices.find(v => v.name === selectedOption);
    
    if (selectedVoice) utterThis.voice = selectedVoice;

    utterThis.rate = parseFloat(rateInput.value);
    utterThis.pitch = parseFloat(pitchInput.value);

    utterThis.onstart = () => {
      speakBtn.disabled = true;
      stopBtn.disabled = false;
      speakBtn.textContent = 'Speaking...';
      speakBtn.classList.add('is-speaking');
    };

    utterThis.onend = utterThis.onerror = () => {
      speakBtn.disabled = false;
      stopBtn.disabled = true;
      speakBtn.textContent = 'Speak Text';
      speakBtn.classList.remove('is-speaking');
    };

    synth.speak(utterThis);
  };

  speakBtn.addEventListener('click', speak);

  stopBtn.addEventListener('click', () => {
    if (synth.speaking) synth.cancel();
  });
});