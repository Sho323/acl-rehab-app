import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';

const FadeInView = ({
  children,
  duration = 600,
  delay = 0,
  fromOpacity = 0,
  toOpacity = 1,
  fromTranslateY = 20,
  toTranslateY = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(fromOpacity)).current;
  const translateYAnim = useRef(new Animated.Value(fromTranslateY)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: toOpacity,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: toTranslateY,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fadeAnim, translateYAnim, duration, delay, toOpacity, toTranslateY]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

FadeInView.propTypes = {
  children: PropTypes.node.isRequired,
  duration: PropTypes.number,
  delay: PropTypes.number,
  fromOpacity: PropTypes.number,
  toOpacity: PropTypes.number,
  fromTranslateY: PropTypes.number,
  toTranslateY: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default FadeInView;