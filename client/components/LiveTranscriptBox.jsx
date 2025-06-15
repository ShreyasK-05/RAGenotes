import React, { useEffect, useRef } from 'react';

const LiveTranscriptBox = ({ text }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div
      ref={boxRef}
      className="mt-6 p-4 border rounded-lg bg-gray-50 text-gray-800 shadow-inner max-h-80 overflow-y-auto"
    >
      <pre className="whitespace-pre-wrap break-words text-left">
        {text || "Start speaking to see the transcript..."}
      </pre>
    </div>
  );
};

export default LiveTranscriptBox;
