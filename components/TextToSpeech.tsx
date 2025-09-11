"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Play, Square } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface TextToSpeechProps {
  text: string;
  className?: string;
  showControls?: boolean;
}

const TextToSpeech = ({ text, className = "", showControls = false }: TextToSpeechProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const populateVoiceList = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        // Find a default voice or fallback to the first one
        const defaultVoice =
          availableVoices.find((voice) => voice.default) || availableVoices[0];
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    // The 'voiceschanged' event fires when the voice list is ready
    speechSynthesis.onvoiceschanged = populateVoiceList;
    populateVoiceList(); // Initial call for browsers that might have them ready

    // Cleanup the event listener on component unmount
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (text.trim() !== "") {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.name === selectedVoice);

      if (voice) {
        utterance.voice = voice;
      }
      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  if (showControls) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select
            aria-label="Select voice"
            value={selectedVoice}
            onValueChange={(value) => setSelectedVoice(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {`${voice.name} (${voice.lang})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rate">
            Rate: <span>{rate}</span>
          </Label>
          <Slider
            min={0.5}
            max={2}
            value={[rate]}
            step={0.1}
            aria-label="Speech rate"
            onValueChange={(value) => setRate(value[0] ?? 1)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pitch">
            Pitch: <span>{pitch}</span>
          </Label>
          <Slider
            min={0}
            max={2}
            value={[pitch]}
            step={0.1}
            aria-label="Speech pitch"
            onValueChange={(value) => setPitch(value[0] ?? 1)}
          />
        </div>

        <Button onClick={handleSpeak} variant="outline" size="sm">
          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Stop" : "Play"}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleSpeak} 
      variant="ghost" 
      size="icon" 
      className={`h-6 w-6 ${className}`}
      aria-label={isPlaying ? "Stop speech" : "Play speech"}
    >
      {isPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
    </Button>
  );
};

export default TextToSpeech;






