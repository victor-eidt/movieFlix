import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const RatingStars: React.FC<Props> = ({ value, max = 5, onChange, disabled = false }) => {
  const stars = useMemo(() => Array.from({ length: max }, (_, index) => index + 1), [max]);

  const handlePress = useCallback(
    (nextValue: number) => {
      if (disabled) {
        return;
      }
      onChange(nextValue);
    },
    [disabled, onChange],
  );

  const handleAccessibilityAction = useCallback(
    (event: { nativeEvent: { actionName: string } }) => {
      if (disabled) {
        return;
      }
      const { actionName } = event.nativeEvent;
      if (actionName === 'increment') {
        onChange(Math.min(max, value + 1));
      } else if (actionName === 'decrement') {
        onChange(Math.max(0, value - 1));
      }
    },
    [disabled, max, onChange, value],
  );

  return (
    <View
      accessible
      accessibilityActions={[
        { name: 'increment', label: 'Aumentar avaliação' },
        { name: 'decrement', label: 'Diminuir avaliação' },
      ]}
      accessibilityHint="Ajuste a nota do filme entre zero e cinco estrelas"
      accessibilityLabel="Avaliação do filme"
      accessibilityRole="adjustable"
      accessibilityValue={{ text: `${value} de ${max}` }}
      onAccessibilityAction={handleAccessibilityAction}
      style={styles.container}
    >
      {stars.map((star) => {
        const filled = star <= value;
        return (
          <Pressable
            key={star}
            accessibilityHint={`Define a avaliação como ${star} estrela${star > 1 ? 's' : ''}`}
            accessibilityLabel={`${filled ? 'Selecionado' : 'Não selecionado'} ${
              star === 1 ? '1 estrela' : `${star} estrelas`
            }`}
            accessibilityRole="button"
            disabled={disabled}
            hitSlop={8}
            onPress={() => handlePress(star)}
            style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}
          >
            <Text style={[styles.star, filled ? styles.starFilled : styles.starOutline]}>★</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  star: {
    fontSize: 28,
  },
  starButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  starFilled: {
    color: '#fbbf24',
  },
  starOutline: {
    color: '#475569',
  },
});

export default React.memo(RatingStars);

