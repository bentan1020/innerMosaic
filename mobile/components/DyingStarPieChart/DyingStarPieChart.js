import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, Animated, Easing } from "react-native";
import Svg, { Path, G, Defs, RadialGradient, Stop } from "react-native-svg";

const { width } = Dimensions.get("window");
const size = width - 16;
const radius = size / 2;

const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
};

const calculatePaths = (data, radius) => {
  const total = data.reduce((acc, entry) => acc + entry.value, 0);
  let startAngle = 0;

  return data.map((entry) => {
    const angle = (entry.value / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const slicePath = describeArc(0, 0, radius, startAngle, endAngle);
    startAngle = endAngle;
    return { path: slicePath, color: entry.color };
  });
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DyingStarPieChart = ({ data }) => {
  // Initialize animated values only once using useState
  const [animatedScales] = useState(() =>
    data.map(() => new Animated.Value(1))
  );

  useEffect(() => {
    let timeouts = [];

    const animateSlice = (animatedScale) => {
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 1.05,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]).start(() => animateSlice(animatedScale));
    };

    animatedScales.forEach((animatedScale, index) => {
      const delay = index * 200;
      timeouts.push(setTimeout(() => animateSlice(animatedScale), delay));
    });

    // Clear timeouts on unmount to prevent memory leaks
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Check for data validity
  if (!data || data.length === 0) {
    return <View>No data available</View>;
  }

  // Calculate paths whenever data changes
  const slices = calculatePaths(data, radius);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          {data.map((entry, index) => (
            <RadialGradient
              key={`grad-${index}`}
              id={`grad-${index}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <Stop offset="10%" stopColor={entry.color} stopOpacity="1" />
              <Stop offset="100%" stopColor={entry.color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>
        <G x={radius} y={radius}>
          {slices.map((slice, index) => {
            const animatedStyle = {
              transform: [
                {
                  scale: animatedScales[index].interpolate({
                    inputRange: [1, 1.05],
                    outputRange: [1, 1.05],
                  }),
                },
              ],
            };
            return (
              <AnimatedPath
                key={`slice-${index}`}
                d={slice.path}
                fill={`url(#grad-${index})`}
                style={animatedStyle}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default DyingStarPieChart;
