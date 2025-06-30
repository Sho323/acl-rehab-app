import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';

const AccessibleText = ({
  children,
  variant = 'bodyMedium',
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'text',
  highContrast = false,
  scalable = true,
  maxFontSizeMultiplier = 1.5,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyle = (variant) => {
    const variants = {
      displayLarge: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
      },
      displayMedium: {
        fontSize: 28,
        fontWeight: '600',
        lineHeight: 36,
      },
      displaySmall: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      headlineLarge: {
        fontSize: 22,
        fontWeight: '600',
        lineHeight: 28,
      },
      headlineMedium: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 26,
      },
      headlineSmall: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
      },
      titleLarge: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
      },
      titleMedium: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
      },
      titleSmall: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
      },
      bodyLarge: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
      },
      bodyMedium: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
      },
      bodySmall: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 18,
      },
      labelLarge: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
      },
      labelMedium: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 18,
      },
      labelSmall: {
        fontSize: 10,
        fontWeight: '500',
        lineHeight: 16,
      },
    };
    return variants[variant] || variants.bodyMedium;
  };

  const variantStyle = getVariantStyle(variant);
  
  const textStyle = [
    variantStyle,
    {
      color: highContrast 
        ? theme.colors.onSurface 
        : theme.colors.onSurfaceVariant,
    },
    style,
  ];

  const textProps = {
    accessible,
    accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : undefined),
    accessibilityHint,
    accessibilityRole,
    allowFontScaling: scalable,
    maxFontSizeMultiplier: scalable ? maxFontSizeMultiplier : 1,
    ...props,
  };

  return (
    <Text style={textStyle} {...textProps}>
      {children}
    </Text>
  );
};

AccessibleText.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'displayLarge', 'displayMedium', 'displaySmall',
    'headlineLarge', 'headlineMedium', 'headlineSmall',
    'titleLarge', 'titleMedium', 'titleSmall',
    'bodyLarge', 'bodyMedium', 'bodySmall',
    'labelLarge', 'labelMedium', 'labelSmall'
  ]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  accessible: PropTypes.bool,
  accessibilityLabel: PropTypes.string,
  accessibilityHint: PropTypes.string,
  accessibilityRole: PropTypes.string,
  highContrast: PropTypes.bool,
  scalable: PropTypes.bool,
  maxFontSizeMultiplier: PropTypes.number,
};

export default AccessibleText;