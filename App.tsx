import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, Animated, Easing, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ★画面サイズ判定
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 700; // iPhone SE (2nd/3rd) 等
const IS_VERY_SMALL = SCREEN_HEIGHT < 600;   // 旧SEなど極小端末

// ★高さ設定の調整 (計算結果エリアを確保するため、ゲーム画面を詰める)
const GAME_HEIGHT = IS_SMALL_DEVICE ? 150 : 220; 
// 小さい端末ではボタンの高さも詰める
const BUTTON_HEIGHT = IS_SMALL_DEVICE ? (SCREEN_HEIGHT < 600 ? 55 : 60) : 80;
// 数字のフォントサイズ
const DISPLAY_FONT_SIZE = IS_SMALL_DEVICE ? 40 : 50;

// --- 3Dパーツ描画用コンポーネント (変更なし) ---
const Voxel = React.memo(({ style, width, height, color, sideColor, topColor, depth = 10 }) => (
  <View style={[style, { width, height }]}>
    <View style={{
      position: 'absolute', right: -depth, bottom: depth,
      width: depth, height: height, backgroundColor: sideColor,
      transform: [{ skewY: '-45deg' }], zIndex: 1
    }} />
    <View style={{
      position: 'absolute', top: -depth, left: depth,
      width: width, height: depth, backgroundColor: topColor,
      transform: [{ skewX: '-45deg' }], zIndex: 2
    }} />
    <View style={{ width: '100%', height: '100%', backgroundColor: color, zIndex: 3 }} />
  </View>
));

// --- 3D ヒツジさん (変更なし) ---
const Sheep3D = () => {
  return (
    <View style={{ width: 50, height: 50 }}>
      <View style={{
        position: 'absolute', bottom: -5, left: 10,
        width: 40, height: 10, backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20, transform: [{ skewX: '-45deg' }]
      }} />
      <View style={{ position: 'absolute', bottom: 0 }}>
        <Voxel style={{ position: 'absolute', bottom: 0, left: 35 }} width={6} height={12} color="#333" sideColor="#111" topColor="#222" depth={4} />
        <Voxel style={{ position: 'absolute', bottom: 0, left: 10 }} width={6} height={12} color="#333" sideColor="#111" topColor="#222" depth={4} />
        <Voxel style={{ position: 'absolute', bottom: 8, left: 0, zIndex: 10 }} width={46} height={36} color="#fff" sideColor="#ccc" topColor="#eee" depth={15} />
        <Voxel style={{ position: 'absolute', bottom: 14, right: -9, zIndex: 20 }} width={26} height={22} color="#ffe4c4" sideColor="#deb887" topColor="#f5deb3" depth={8} />
        <View style={{ position: 'absolute', bottom: 26, right: 0, width: 4, height: 4, backgroundColor: '#000', zIndex: 30 }} />
        <Voxel style={{ position: 'absolute', bottom: -5, left: 25, zIndex: 5 }} width={6} height={12} color="#333" sideColor="#111" topColor="#222" depth={4} />
        <Voxel style={{ position: 'absolute', bottom: -5, left: 5, zIndex: 5 }} width={6} height={12} color="#333" sideColor="#111" topColor="#222" depth={4} />
      </View>
    </View>
  );
};

// --- 3D カニさん (変更なし) ---
const Crab3D = ({ animValue }) => {
  const clawMove = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  return (
    <View style={{ width: 50, height: 40 }}>
      <View style={{
        position: 'absolute', bottom: -5, left: 5,
        width: 40, height: 8, backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20, transform: [{ skewX: '-45deg' }]
      }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, width: 5, height: 10, backgroundColor: '#c00', transform:[{rotate:'20deg'}]}} />
      <View style={{ position: 'absolute', bottom: 0, right: 10, width: 5, height: 10, backgroundColor: '#c00', transform:[{rotate:'-20deg'}]}} />
      <Voxel style={{ position: 'absolute', bottom: 5, left: 5 }} width={40} height={25} color="#ff4d4d" sideColor="#cc0000" topColor="#ff6666" depth={10} />
      <View style={{ position: 'absolute', top: 0, left: 15, width: 4, height: 10, backgroundColor: '#cc0000' }} />
      <View style={{ position: 'absolute', top: 0, right: 20, width: 4, height: 10, backgroundColor: '#cc0000' }} />
      <View style={{ position: 'absolute', top: -2, left: 14, width: 6, height: 6, backgroundColor: '#000', borderRadius:3 }} />
      <View style={{ position: 'absolute', top: -2, right: 19, width: 6, height: 6, backgroundColor: '#000', borderRadius:3 }} />
      <Animated.View style={{ position: 'absolute', top: 10, left: -10, transform: [{ translateY: clawMove }] }}>
        <Voxel width={12} height={12} color="#ff4d4d" sideColor="#cc0000" topColor="#ff6666" depth={5} />
      </Animated.View>
      <Animated.View style={{ position: 'absolute', top: 10, right: -5, transform: [{ translateY: clawMove }] }}>
        <Voxel width={12} height={12} color="#ff4d4d" sideColor="#cc0000" topColor="#ff6666" depth={5} />
      </Animated.View>
    </View>
  );
};

// --- 3D 雲 (変更なし) ---
const DriftingCloud = ({ startX, y, speed, size }) => {
  const anim = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(SCREEN_WIDTH + 100);
      Animated.timing(anim, {
        toValue: -150, duration: 10000 / speed, useNativeDriver: Platform.OS !== 'web', 
        easing: Easing.linear
      }).start(() => loop());
    };
    loop();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', top: y, left: 0, transform: [{ translateX: anim }, { scale: size }] }}>
      <View style={{ opacity: 0.9 }}>
        <View style={{ position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', left: 0, top: 10 }} />
        <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', left: 25, top: 0 }} />
        <View style={{ position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', left: 60, top: 15 }} />
        <View style={{ position: 'absolute', width: 80, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.1)', top: 60, left: 10 }} />
      </View>
    </Animated.View>
  );
};

// --- メインアプリ ---
export default function App() {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [lastHistory, setLastHistory] = useState(null);

  const displayValueRef = useRef('0');
  const operatorRef = useRef(null);
  const firstValueRef = useRef('');
  const waitingForSecondOperandRef = useRef(false);

  useEffect(() => {
    displayValueRef.current = displayValue;
    operatorRef.current = operator;
    firstValueRef.current = firstValue;
    waitingForSecondOperandRef.current = waitingForSecondOperand;
  }, [displayValue, operator, firstValue, waitingForSecondOperand]);

  const sheepYAnim = useRef(new Animated.Value(0)).current;
  const crabXAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const sheepYVal = useRef(0);
  const velocityRef = useRef(0);
  const crabXVal = useRef(SCREEN_WIDTH);
  
  const [score, setScore] = useState(0);

  const [skyColor, setSkyColor] = useState('#87CEEB'); 
  const [milestoneText, setMilestoneText] = useState('');

  const gameLoopRef = useRef(null);
  const isGameOverRef = useRef(false);
  const boomTimeoutRef = useRef(null);
  
  const scoreScaleAnim = useRef(new Animated.Value(1)).current;
  const milestoneOpacityAnim = useRef(new Animated.Value(0)).current;
  const crabAnim = useRef(new Animated.Value(0)).current; 
  const groundOffset = useRef(new Animated.Value(0)).current; 

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = 13;
  const CRAB_SPEED = 5;

  useEffect(() => {
    startLoop();
    startAnimations();
    return () => stopLoop();
  }, []);

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(crabAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(crabAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(groundOffset, {
        toValue: -50, duration: 500, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' 
      })
    ).start();
  };

  useEffect(() => {
    if (score === 0) return;
    Animated.sequence([
      Animated.timing(scoreScaleAnim, { toValue: 1.5, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scoreScaleAnim, { toValue: 1, friction: 3, useNativeDriver: Platform.OS !== 'web' })
    ]).start();

    if (score % 10 === 0) {
      triggerMilestoneEffect();
    }
  }, [score]);

  const triggerMilestoneEffect = () => {
    setSkyColor('#FFD700'); 
    setMilestoneText('SUPER!! 🌟');
    Animated.sequence([
      Animated.timing(milestoneOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(1000),
      Animated.timing(milestoneOpacityAnim, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' })
    ]).start(() => {
      setSkyColor('#87CEEB'); 
      setMilestoneText('');
    });
  };

  const startLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(() => {
      if (isGameOverRef.current) return;

      if (sheepYVal.current > 0 || velocityRef.current > 0) {
        sheepYVal.current += velocityRef.current;
        velocityRef.current -= GRAVITY;
        if (sheepYVal.current <= 0) {
          sheepYVal.current = 0; velocityRef.current = 0;
        }
      }
      sheepYAnim.setValue(sheepYVal.current);

      crabXVal.current -= CRAB_SPEED;
      if (crabXVal.current < -80) { 
        const randomDelay = Math.random() * 500 + 100; 
        crabXVal.current = SCREEN_WIDTH + randomDelay; 
        setScore(s => s + 1); 
      }
      crabXAnim.setValue(crabXVal.current);

      const sheepHitBox = { x: 60, width: 30, y: sheepYVal.current };
      const crabHitBox = { x: crabXVal.current + 10, width: 30, y: 0 };
      const isXOverlap = (sheepHitBox.x < crabHitBox.x + crabHitBox.width) && (sheepHitBox.x + sheepHitBox.width > crabHitBox.x);
      const isYOverlap = sheepHitBox.y < 30; 

      if (isXOverlap && isYOverlap) {
        handleCollision();
      }
    }, 16); 
  };

  const stopLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const getDisplayText = () => {
    if (displayValue === 'BOOM! 💥') return displayValue;
    if (operator && firstValue) return waitingForSecondOperand ? `${firstValue} ${operator}` : `${firstValue} ${operator} ${displayValue}`;
    return displayValue;
  };

  const getHistoryTextFromRef = () => {
    const dVal = displayValueRef.current;
    const op = operatorRef.current;
    const fVal = firstValueRef.current;
    const waiting = waitingForSecondOperandRef.current;
    if (op && fVal) {
      return waiting ? `${fVal} ${op}` : `${fVal} ${op} ${dVal}`;
    }
    return dVal;
  };

  const handleCollision = () => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    const currentText = getHistoryTextFromRef();
    setLastHistory(currentText);
    setDisplayValue('BOOM! 💥'); 
    setScore(0);
    if (boomTimeoutRef.current) clearTimeout(boomTimeoutRef.current);
    boomTimeoutRef.current = setTimeout(() => resetGameAfterBoom(), 1500);
  };

  const resetGameAfterBoom = () => {
    setDisplayValue('0');
    setOperator(null);
    setFirstValue('');
    setWaitingForSecondOperand(false);
    crabXVal.current = SCREEN_WIDTH + 300;
    crabXAnim.setValue(SCREEN_WIDTH + 300);
    isGameOverRef.current = false;
  };

  const jump = () => {
    if (sheepYVal.current === 0) velocityRef.current = JUMP_STRENGTH;
  };

  const handlePress = (input) => {
    if (isGameOverRef.current || displayValue === 'BOOM! 💥') {
      if (boomTimeoutRef.current) clearTimeout(boomTimeoutRef.current);
      isGameOverRef.current = false;
      crabXVal.current = SCREEN_WIDTH + 300;
      crabXAnim.setValue(SCREEN_WIDTH + 300);
      if (displayValue === 'BOOM! 💥') {
         setDisplayValue('0'); setOperator(null); setFirstValue('');
      }
    }
    jump();
    if (input === 'C') {
      setDisplayValue('0'); setOperator(null); setFirstValue(''); setWaitingForSecondOperand(false);
    } else if (input === '▶') {
      if (waitingForSecondOperand && operator) {
        setOperator(null); setWaitingForSecondOperand(false);
      } else if (!waitingForSecondOperand && displayValue !== '0' && displayValue.length > 0) {
        const newValue = displayValue.slice(0, -1);
        setDisplayValue(newValue === '' ? '0' : newValue);
      }
    } else if (input === '=') {
      if (operator && firstValue) {
        const result = calculate(firstValue, displayValue, operator);
        setDisplayValue(String(result)); setOperator(null); setFirstValue(''); setWaitingForSecondOperand(true);
      }
    } else if (['+', '-', '×', '÷'].includes(input)) {
      setOperator(input); setFirstValue(displayValue); setWaitingForSecondOperand(true); 
    } else {
      if (waitingForSecondOperand) {
        setDisplayValue(input === '.' ? '0.' : input); setWaitingForSecondOperand(false);
      } else {
        if (displayValue === 'BOOM! 💥') {
           setDisplayValue(input === '.' ? '0.' : input);
        } else {
          if (input === '.') {
            if (displayValue.includes('.')) return;
            setDisplayValue(displayValue + input); 
          } else {
            setDisplayValue(displayValue === '0' ? input : displayValue + input);
          }
        }
      }
    }
  };

  const calculate = (first, second, op) => {
    const a = parseFloat(first); const b = parseFloat(second);
    if (isNaN(a) || isNaN(b)) return 0;
    let res = 0;
    switch (op) { case '+': res = a + b; break; case '-': res = a - b; break; case '×': res = a * b; break; case '÷': res = a / b; break; }
    return Math.round(res * 100000000) / 100000000;
  };

  const CalcButton = ({ label, color = '#333', labelColor = '#fff', flex = 1 }) => (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color, flex: flex, height: BUTTON_HEIGHT }]} // ボタン高さも動的に
      onPress={() => handlePress(label)} activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, { color: labelColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={[styles.gameContainer, { backgroundColor: skyColor }]}>
          <View style={{ position: 'absolute', bottom: 40, left: -50, width: 200, height: 200, backgroundColor: '#8FBC8F', transform: [{ rotate: '45deg' }] }} />
          <View style={{ position: 'absolute', bottom: 40, right: -50, width: 250, height: 250, backgroundColor: '#228B22', transform: [{ rotate: '45deg' }] }} />
          <DriftingCloud startX={50} y={20} speed={0.8} size={0.8} />
          <DriftingCloud startX={250} y={50} speed={1.2} size={1.2} />
          <DriftingCloud startX={400} y={10} speed={0.5} size={0.6} />
          <Text style={styles.gameTitle}>Action Calc 3D Turbo 🚀</Text>
          <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scoreScaleAnim }] }]}>
            <Text style={styles.scoreText}>Avoid: {score}</Text>
          </Animated.View>
          <Animated.View style={[styles.milestoneContainer, { opacity: milestoneOpacityAnim }]}>
            <Text style={styles.milestoneText}>{milestoneText}</Text>
          </Animated.View>
          <View style={styles.groundContainer}>
            <Animated.View style={[styles.groundPattern, { transform: [{ translateX: groundOffset }] }]}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={[styles.groundTile, { left: i * 50 }]} />
              ))}
            </Animated.View>
            <View style={styles.groundGrass} />
          </View>
          <View style={{ position: 'absolute', bottom: 30, width: '100%', height: 100 }}>
            <Animated.View style={{ position: 'absolute', bottom: 0, left: 40, zIndex: 100, transform: [{ translateY: Animated.multiply(sheepYAnim, -1) }] }}>
              <Sheep3D /> 
            </Animated.View>
            <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 90, transform: [{ translateX: crabXAnim }] }}>
              <Crab3D animValue={crabAnim} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.displayContainer}>
          {/* ★小さい画面では履歴を非表示にして、メインの計算結果を優先する */}
          {!IS_SMALL_DEVICE && lastHistory !== null && (
            <Text style={styles.historyText}>{lastHistory}</Text>
          )}
          
          <Text 
            style={[styles.displayText, { fontSize: DISPLAY_FONT_SIZE }]} // フォントサイズも動的に
            numberOfLines={1} 
            adjustsFontSizeToFit
          >
            {getDisplayText()}
          </Text>
        </View>

        <View style={styles.keypad}>
          <View style={styles.row}>
            <CalcButton label="C" color="#a5a5a5" labelColor="#000" flex={2} />
            <CalcButton label="▶" color="#ff9f0a" />
            <CalcButton label="÷" color="#ff9f0a" />
          </View>
          <View style={styles.row}>
            <CalcButton label="7" />
            <CalcButton label="8" />
            <CalcButton label="9" />
            <CalcButton label="×" color="#ff9f0a" />
          </View>
          <View style={styles.row}>
            <CalcButton label="4" />
            <CalcButton label="5" />
            <CalcButton label="6" />
            <CalcButton label="-" color="#ff9f0a" />
          </View>
          <View style={styles.row}>
            <CalcButton label="1" />
            <CalcButton label="2" />
            <CalcButton label="3" />
            <CalcButton label="+" color="#ff9f0a" />
          </View>
          <View style={styles.row}>
            <CalcButton label="0" flex={2.2} />
            <CalcButton label="." />
            <CalcButton label="=" color="#ff9f0a" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#000',
    // Webブラウザで、下部に余計なパディングが入りすぎないように調整
    paddingBottom: Platform.OS === 'web' ? 0 : 0, 
  },
  gameContainer: {
    height: GAME_HEIGHT, 
    position: 'relative', overflow: 'hidden', borderBottomWidth: 4, borderColor: '#fff',
  },
  groundContainer: {
    position: 'absolute', bottom: 0, width: '100%', height: 40, backgroundColor: '#654321', overflow: 'hidden',
  },
  groundGrass: {
    position: 'absolute', top: 0, width: '100%', height: 10, backgroundColor: '#4caf50',
  },
  groundPattern: {
    position: 'absolute', bottom: 0, width: '200%', height: '100%', flexDirection: 'row',
  },
  groundTile: {
    position: 'absolute', bottom: 0, width: 20, height: 20, backgroundColor: '#8B4513', opacity: 0.5, borderRadius: 5,
  },
  gameTitle: { position: 'absolute', top: 10, left: 10, color: '#fff', fontWeight: 'bold', textShadowColor:'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  scoreContainer: { position: 'absolute', top: 10, right: 15, zIndex: 10 },
  scoreText: { color: '#fff', fontWeight: 'bold', fontSize: 18, textShadowColor:'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  milestoneContainer: { position: 'absolute', top: 60, width: '100%', alignItems: 'center', zIndex: 20 },
  milestoneText: { color: '#FFD700', fontSize: 40, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 5 },
  
  displayContainer: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'flex-end', 
    padding: 20,
    // ★最小高さを撤廃。flexに任せることで、狭い画面でも押しつぶされないようにする
  },
  displayText: { color: '#fff', fontWeight: '300' }, // サイズは動的指定に変更
  historyText: { color: '#888', fontSize: 24, marginBottom: 5, fontWeight: '300' },
  
  keypad: { 
    paddingBottom: 5,
    paddingHorizontal: 10,
    marginBottom: Platform.OS === 'web' ? 5 : 0,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  
  button: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 40, 
    marginHorizontal: 5 
  },
  buttonText: { fontSize: 30, fontWeight: '500' },
});