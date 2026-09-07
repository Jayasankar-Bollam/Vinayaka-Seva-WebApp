// client/src/components/FadeInOnScroll.jsx
import { useEffect, useRef, useState } from 'react';

export default function FadeInOnScroll({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only need to trigger once, then stop watching
        }
      },
      { threshold: 0.1 } // fires once 10% of the element is visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect(); // cleanup when the component unmounts
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}