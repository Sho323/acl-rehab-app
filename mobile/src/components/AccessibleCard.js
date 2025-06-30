import React from 'react';
import { View, Animated, Pressable } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';

const AccessibleCard = ({
  children,
  style,
  onPress,
  elevation = 2,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  animationDuration = 150,
  scaleValue = 0.98,
  disabled = false,
  ...props
}) => {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  const animatePress = (pressed) => {
    const animations = [
      Animated.timing(scaleAnim, {
        toValue: pressed ? scaleValue : 1,
        duration: animationDuration,
        useNativeDriver: true,
      })
    ];

    if (disabled) {
      animations.push(
        Animated.timing(opacityAnim, {
          toValue: pressed ? 0.5 : 0.6,
          duration: animationDuration,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const cardStyle = [
    {
      transform: [{ scale: scaleAnim }],
      opacity: disabled ? opacityAnim : 1,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: elevation,
      },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
      elevation: elevation,
    },
    style,
  ];

  if (onPress && !disabled) {
    return (
      <Animated.View style={cardStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole={accessibilityRole}
          style={{ borderRadius: 12 }}
        >
          <Card {...props} style={{ elevation: 0 }}>
            {children}
          </Card>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={cardStyle}>
      <Card {...props} style={{ elevation: 0 }}>
        {children}
      </Card>
    </Animated.View>
  );
};

AccessibleCard.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
  elevation: PropTypes.number,
  accessible: PropTypes.bool,
  accessibilityLabel: PropTypes.string,
  accessibilityHint: PropTypes.string,
  accessibilityRole: PropTypes.string,
  animationDuration: PropTypes.number,
  scaleValue: PropTypes.number,
  disabled: PropTypes.bool,
};

export default AccessibleCard;