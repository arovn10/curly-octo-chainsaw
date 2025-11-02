import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface CookingTimerProps {
  onTimeUpdate?: (minutes: number, seconds: number) => void;
  onTimerComplete?: (totalSeconds: number) => void;
  autoStart?: boolean;
}

export default function CookingTimer({
  onTimeUpdate,
  onTimerComplete,
  autoStart = false,
}: CookingTimerProps) {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const pauseTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - pauseTimeRef.current * 1000;
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current!) / 1000) + pauseTimeRef.current;
        setElapsedSeconds(elapsed);
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        onTimeUpdate?.(minutes, seconds);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onTimeUpdate]);

  const handleStart = () => {
    if (isPaused) {
      // Resume from where we paused
      setIsPaused(false);
      startTimeRef.current = Date.now() - pauseTimeRef.current * 1000;
    } else {
      // Start fresh or continue
      startTimeRef.current = Date.now() - pauseTimeRef.current * 1000;
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
    pauseTimeRef.current = elapsedSeconds;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    pauseTimeRef.current = 0;
    setElapsedSeconds(0);
    startTimeRef.current = null;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.timerLabel}>
          {isRunning ? '⏱️ Cooking...' : isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isRunning && !isPaused && (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
            <Text style={styles.buttonText}>▶️ Start Timer</Text>
          </TouchableOpacity>
        )}

        {isRunning && (
          <>
            <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={handlePause}>
              <Text style={styles.buttonText}>⏸️ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.buttonText}>⏹️ Stop</Text>
            </TouchableOpacity>
          </>
        )}

        {isPaused && (
          <>
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
              <Text style={styles.buttonText}>▶️ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.buttonText}>⏹️ Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {(isRunning || isPaused) && elapsedSeconds > 0 && (
        <Text style={styles.timeInfo}>
          {minutes} minute{minutes !== 1 ? 's' : ''} {seconds} second{seconds !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeInfo: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

