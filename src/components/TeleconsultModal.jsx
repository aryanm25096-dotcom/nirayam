import { useState, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Activity,
  User,
  Stethoscope,
  Loader2,
} from 'lucide-react';
import './TeleconsultModal.css';

/**
 * MOCK: WebRTC connection simulation for prototype teleconsultation between Doctor and ASHA worker.
 *
 * Implements a simulated WebRTC P2P lifecycle:
 * 1. SDP Offer & Answer negotiation (signaling simulation)
 * 2. ICE candidate gathering & DTLS handshake
 * 3. Connected state with live encrypted bi-directional stream
 * 4. Audio/video track muting & call tear-down
 */
export default function TeleconsultModal({
  isOpen,
  onClose,
  currentRole = 'doctor', // 'doctor' | 'asha'
  patientName = 'Sunita Sharma',
  partnerName = 'Sunita Devi (CHO / ASHA)',
}) {
  const [connectionState, setConnectionState] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Simulate WebRTC peer connection establishment
  useEffect(() => {
    if (!isOpen) {
      setConnectionState('connecting');
      setElapsedSeconds(0);
      return;
    }

    setConnectionState('connecting');
    const timer = setTimeout(() => {
      setConnectionState('connected');
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Live call timer
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState]);

  if (!isOpen) return null;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const isDoctor = currentRole === 'doctor';
  const localLabel = isDoctor ? 'Dr. Ananya Sharma, MD (Local)' : 'Sunita Devi (CHO / ASHA — Local)';
  const remoteLabel = isDoctor
    ? partnerName || 'Sunita Devi (CHO / ASHA — Sub-Centre Rampur)'
    : 'Dr. Ananya Sharma, MD (Cardiology / Internal Medicine)';

  return (
    <div className="teleconsult-overlay" role="dialog" aria-modal="true" aria-labelledby="teleconsult-title">
      <div className="teleconsult-dialog">
        {/* Header */}
        <header className="teleconsult-header">
          <div className="teleconsult-title-row">
            <div className="teleconsult-badge">
              <Activity size={18} aria-hidden="true" />
              <span>NIRAMAY TELE-CONSULTATION</span>
            </div>
            <div className="teleconsult-secure-badge">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>WebRTC Mock P2P Encrypted</span>
            </div>
          </div>
          <div className="teleconsult-case-info">
            <h2 id="teleconsult-title" className="teleconsult-heading">
              Case Review: {patientName}
            </h2>
            <span className="teleconsult-timer" aria-live="polite">
              {connectionState === 'connected' ? `Duration: ${formatTimer(elapsedSeconds)}` : 'Establishing P2P link...'}
            </span>
          </div>
        </header>

        {/* Video Streams Container */}
        <div className="teleconsult-stage">
          {connectionState === 'connecting' ? (
            <div className="teleconsult-connecting-state">
              <Loader2 size={40} className="spin-icon" aria-hidden="true" />
              <p className="connecting-text">Exchanging WebRTC SDP Offer / Answer &amp; ICE Candidates...</p>
              <span className="connecting-subtext">Connecting Sub-Centre Rampur to District OPD Room #4</span>
            </div>
          ) : (
            <div className="teleconsult-video-grid">
              {/* Remote Participant (Main View) */}
              <div className="teleconsult-video-card remote-stream">
                <div className="participant-avatar-large">
                  {isDoctor ? <User size={56} aria-hidden="true" /> : <Stethoscope size={56} aria-hidden="true" />}
                </div>
                <div className="participant-video-overlay">
                  <span className="stream-badge remote-badge">
                    <span className="pulse-indicator" aria-hidden="true" />
                    {remoteLabel}
                  </span>
                  <span className="location-pill">Bandwidth: 1.4 Mbps • 720p HD</span>
                </div>
              </div>

              {/* Local Participant (PiP View) */}
              <div className={`teleconsult-video-card local-stream ${isVideoMuted ? 'video-off' : ''}`}>
                <div className="participant-avatar-small">
                  {isDoctor ? <Stethoscope size={28} aria-hidden="true" /> : <User size={28} aria-hidden="true" />}
                </div>
                <div className="participant-video-overlay">
                  <span className="stream-badge local-badge">
                    {localLabel}
                  </span>
                  {isVideoMuted && <span className="muted-indicator">Video Paused</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <footer className="teleconsult-controls">
          <button
            type="button"
            className={`control-btn ${isAudioMuted ? 'control-btn--muted' : ''}`}
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            aria-label={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff size={20} aria-hidden="true" /> : <Mic size={20} aria-hidden="true" />}
            <span>{isAudioMuted ? 'Unmute' : 'Mute Mic'}</span>
          </button>

          <button
            type="button"
            className={`control-btn ${isVideoMuted ? 'control-btn--muted' : ''}`}
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            aria-label={isVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoMuted ? <VideoOff size={20} aria-hidden="true" /> : <Video size={20} aria-hidden="true" />}
            <span>{isVideoMuted ? 'Start Video' : 'Stop Video'}</span>
          </button>

          <button
            type="button"
            className="control-btn control-btn--end"
            onClick={onClose}
            aria-label="End Teleconsultation Call"
          >
            <PhoneOff size={20} aria-hidden="true" />
            <span>End Call</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
