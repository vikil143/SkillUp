// seed/skills/embedded.js — Arduino, ESP32, MicroPython, I2C, SPI, Raspberry Pi
import { mk } from '../helpers.js';

export default function buildEmbeddedSkills() {
  return [
    mk('Arduino', 'embedded', null, {
      definition: 'Open-source electronics platform with simple IDE and C/C++ runtime for microcontrollers.',
    }),
    mk('ESP32', 'embedded', null, {
      definition: 'Low-cost SoC with WiFi/Bluetooth from Espressif. Dual-core, programmable in C++ or MicroPython.',
    }),
    mk('MicroPython', 'embedded', null, {
      definition: 'Lean Python 3 implementation for microcontrollers. Runs on ESP32, RP2040, STM32 and others.',
    }),
    mk('I2C', 'embedded', null, {
      definition: 'Two-wire serial protocol for connecting low-speed peripherals. Master/slave with addresses.',
    }),
    mk('SPI', 'embedded', null, {
      definition: 'Four-wire synchronous serial protocol. Faster than I2C, full-duplex, used for displays, sensors, SD cards.',
    }),
    mk('Raspberry Pi', 'embedded', null, {
      definition: 'Single-board Linux computer with GPIO pins. Used for prototyping, robotics, and IoT projects.',
    }),
  ];
}
