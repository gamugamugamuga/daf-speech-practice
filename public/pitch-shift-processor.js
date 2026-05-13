class PitchShiftProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'pitchRatio', defaultValue: 1, minValue: 0.5, maxValue: 2 }];
  }

  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.phase = 0;
  }

  readInterpolated(index) {
    const size = this.bufferSize;
    const wrapped = ((index % size) + size) % size;
    const indexA = Math.floor(wrapped);
    const indexB = (indexA + 1) % size;
    const fraction = wrapped - indexA;
    return this.buffer[indexA] * (1 - fraction) + this.buffer[indexB] * fraction;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    if (!output) {
      return true;
    }

    if (!input) {
      output.fill(0);
      return true;
    }

    const ratios = parameters.pitchRatio;
    const grainSize = 1024;

    for (let i = 0; i < output.length; i += 1) {
      const ratio = ratios.length > 1 ? ratios[i] : ratios[0];
      this.buffer[this.writeIndex] = input[i];

      const phaseA = this.phase;
      const phaseB = (this.phase + 0.5) % 1;
      const windowA = 0.5 - 0.5 * Math.cos(2 * Math.PI * phaseA);
      const windowB = 0.5 - 0.5 * Math.cos(2 * Math.PI * phaseB);
      const readA = this.writeIndex - phaseA * grainSize * ratio - 128;
      const readB = this.writeIndex - phaseB * grainSize * ratio - 128;

      output[i] = this.readInterpolated(readA) * windowA + this.readInterpolated(readB) * windowB;

      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.phase = (this.phase + Math.abs(ratio - 1) / grainSize + 1 / (grainSize * 8)) % 1;
    }

    return true;
  }
}

registerProcessor('pitch-shift-processor', PitchShiftProcessor);
