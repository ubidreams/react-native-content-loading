import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import Svg, {Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    ClipPath,
    Text,
    Use,
    Defs,
    Stop} from 'react-native-svg';
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const {interpolate} = require('d3-interpolate');

export default class ContentLoader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            offsetValues: [
                '-2', '-1.5', '-1'
            ],
            offsets: [
              '0.0001', '0.0002', '0.0003' // Avoid duplicate value cause error in Android
            ],
            frequence: props.duration / 2
        }
        this._animate = new Animated.Value(0)
        this.loopAnimation = this
            .loopAnimation
            .bind(this)
    }
    offsetValueBound(x) {
        if (x > 1) {
            return '1'
        }
        if (x < 0) {
            return '0'
        }
        return x
    }
    componentDidMount(props) {
        this.loopAnimation()
    }

    componentWillUnmount() {
      cancelAnimationFrame(this.animationId);
      Animated.timing(this._animate).stop();
    }

    loopAnimation() {

        // setup interpolate
        let interpolator = interpolate(this.state, {
            offsetValues: ['1', '1.5', '2']
        });

        // start animation
        let start = Date.now();
        this._animation = () => {
            const now = Date.now();
            let t = (now - start) / this.props.duration;
            if (t > 1) {
                t = 1
            }

            let newState = interpolator(t);
            let offsetValues = [];
            offsetValues[0] = this.offsetValueBound(newState.offsetValues[0]);
            offsetValues[1] = this.offsetValueBound(newState.offsetValues[1]);
            offsetValues[2] = this.offsetValueBound(newState.offsetValues[2]);
            
            // Make sure at least two offsets is different
            // original fix from: https://github.com/virusvn/react-native-svg-animated-linear-gradient/commit/b9558aab3bbd8f5be50204dd5cb67c9348c60fb9
            if (offsetValues[0] !== offsetValues[1] ||
              offsetValues[0] !== offsetValues[2] ||
              offsetValues[1] !== offsetValues[2]) {
              this.setState({ offsets: offsetValues });
            }

            if (t < 1) {
                this.animationId = requestAnimationFrame(this._animation);
            }
        }
        this.animationId = requestAnimationFrame(this._animation);

        // Setup loop animation
        Animated.sequence([
            Animated.timing(this._animate, {
                toValue: 1,
                duration: this.state.frequence
            }),
            Animated.timing(this._animate, {
                toValue: 0,
                duration: this.state.frequence
            })
        ]).start((event) => {
            if (event.finished) {
                this.loopAnimation()
            }
        })

    }
    render() {
        return (
            <View>
                <AnimatedSvg height={this.props.height} width={this.props.width}>
                    <Defs>
                        <LinearGradient id="grad" x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2}>
                            <Stop
                                offset={this.state.offsets[0]}
                                stopColor={this.props.primaryColor}
                                stopOpacity="1"/>
                            <Stop
                                offset={this.state.offsets[1]}
                                stopColor={this.props.secondaryColor}
                                stopOpacity="1"/>
                            <Stop
                                offset={this.state.offsets[2]}
                                stopColor={this.props.primaryColor}
                                stopOpacity="1"/>
                        </LinearGradient>
                        <ClipPath id="clip">
                            <G>
                                {this.props.children}
                            </G>
                        </ClipPath>
                    </Defs>

                    <Rect
                        x="0"
                        y="0"
                        height={this.props.height}
                        width={this.props.width}
                        fill="url(#grad)"
                        clipPath="url(#clip)"/>
                </AnimatedSvg>
            </View>
        );
    }
}
ContentLoader.defaultProps = {
    primaryColor: '#eeeeee',
    secondaryColor: '#dddddd',
    duration: 2000,
    width: 300,
    height: 200,
    x1: '0',
    y1: '0',
    x2: '100%',
    y2: '0'
}
