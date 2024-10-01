# PSWH Project

This project is designed to run a validation process for a prototype as soon as it powers on. The project involves several hardware components, including color sensors, resistance meters, LEDs, and a DFPlayer for sound output. The validation logic checks the figures using resistance measurements, color data, and provides feedback via lights and sound.

## Project Structure

### Main Files
- **`main.py`**: The entry point of the project. This script runs the entire validation process, which includes checking the readiness of figures, performing color and resistance measurements, and giving feedback via lights and sound. The validation loop runs automatically once the system is powered on.

### Directory Structure
- **`tests/`**: 
  - Contains test files for individual components like the color sensor, resistance meter, and other hardware modules.
  - The test files are self-contained and help test the functionality of each component independently.
  - No specific structure or documentation is provided in this directory; the purpose is to aid in the development and debugging of individual hardware modules.

- **`lib/`**: 
  - Contains all custom-written classes that control the components such as sensors, light rings, resistance meters, and more.
  - Also includes external libraries, linked via symbolic links, which are used to control certain hardware components.
    - DFPlayer: [PicoDFPlayer](https://github.com/mannbro/PicoDFPlayer/blob/main/picodfplayer.py) by [mannbro](https://github.com/mannbro) under the [MIT License](https://opensource.org/license/MIT)
    - ADS: [Driver for the ADS1015/ADS1115 Analogue-Digital Converter](https://github.com/robert-hh/ads1x15/blob/master/ads1x15.py) by [Robert Hammelrath](https://github.com/robert-hh) and [Radomir Dopieralski](https://github.com/deshipu) under the [MIT License](https://opensource.org/license/MIT)

## Classes Overview

### **Main Classes in `lib/`:**

#### 1. **`Lightring`**
   - **Purpose**: Controls the LEDs in the light ring.
   - **Methods**:
     - `fill(color)`: Fills the light ring with a specific color.
     - `spinning_pattern()`: Animates the light ring in a spinning pattern.
     - `blink_red()` / `blink_green()`: Blink the light ring in red or green to signal failure or success.
     - `blink_solution()`: Blinks the light ring in a specific pattern to show the solution.

#### 2. **`ResistanceMeter`**
   - **Purpose**: Measures resistance values through a Wheatstone Bridge using either the Pico's ADC or an external ADS1115 ADC.
   - **Attributes**:
     - `id_in`: ID for the specific meter.
     - `ads`: Boolean indicating whether to use the ADS1115 for more precise measurements.
   - **Methods**:
     - `read_voltage()`: Reads voltage values from the resistance meter.
     - `bridge_with_figure()`: Validates the voltage with a predefined range for the figures.
     - `validate_voltage_ads()`: Validates the voltage readings using ADS1115.
     - `validate_voltage_pico()`: Validates voltage using Pico’s internal ADC.
   
#### 3. **`Color_Sensor`**
   - **Purpose**: Interfaces with TCS3472 color sensors to detect and read RGB and clear light data.
   - **Methods**:
     - `read_all_sensors()`: Reads data from multiple color sensors.
     - `read()`: Reads individual RGB and clear values from the sensor and returns them.
   
#### 4. **`DFPlayer`**
   - **Purpose**: Controls the DFPlayer module to play sound files.
   - **Methods**:
     - `playTrack(file, song)`: Plays a specific song.
     - `setVolume()`: Sets the volume of the DFPlayer.
     - `queryBusy()`: Checks if the DFPlayer is currently playing a track.

### Validation Process (`main.py`)

1. **LED Initialization**: Turns off all sensor LEDs at the beginning.
2. **Play Song**: Plays an initial sound to start the process.
3. **Figure Readiness**: The system checks if the figures (resistance sensors) are ready by analyzing voltage readings. If not ready, it will retry until the figures are detected.
4. **Color and Resistance Measurement**: 
   - The system performs a color measurement using `Color_Sensor` and checks the resistance values using the `ResistanceMeter`.
5. **Validation**: Combines the results from both color and resistance measurements to ensure they are within acceptable ranges.
6. **Feedback**: 
   - If the validation passes, a success sound is played, and the light ring blinks green.
   - If validation fails, an error sound is played, and the light ring blinks red.
7. **Final Exit**: The system either exits on success or retries for a set number of trials before indicating failure.


## Setup

1. **Hardware Setup**:
   - Color sensors (TCS3472)
   - Resistance meters
   - DFPlayer mini with speaker for sound output
   - Pico or compatible microcontroller
   - LEDs for visual feedback

2. **Software Setup**:
   - Place the `main.py` file in the root of your Pico or microcontroller’s file system.
   - Ensure that all necessary libraries (both custom and external) are in the `lib-directory/`.
   - Run the system; the validation process will start automatically when the system is powered on.

---

