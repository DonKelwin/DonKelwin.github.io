from machine import I2C, Pin
import time

i2c = I2C(1, scl=Pin(15), sda=Pin(14), freq=400000)

PCA9548A_ADDR = 0x70
TCS3472_ADDR = 0x29

CHANNEL_NAMES = ["Fillennium Malcon", "X-Wing", "TIE-Fighter"]


# Selects a specific channel on the PCA9548A I2C multiplexer.
# 
# Parameters:
# - i2c (I2C): The I2C object that manages communication with the devices connected to the I2C bus.
# - channel (int): Integer between 0 and 7, indicating which channel of the PCA9548A multiplexer to select.
#
# Raises:
# - ValueError: If the channel is not between 0 and 7.
def select_channel(i2c, channel):
    if channel < 0 or channel > 7:
        raise ValueError("Kanal muss zwischen 0 und 7 liegen.")
    i2c.writeto(PCA9548A_ADDR, bytearray([1 << channel]))
    time.sleep(0.2)  # Kurze Pause, um sicherzustellen, dass der Kanal richtig gesetzt ist


# Initializes the TCS3472 color sensor by setting the control and timing registers.
#
# Parameters:
# - i2c (I2C): The I2C object that manages communication with the TCS3472 sensor.
#
# Details:
# - Powers on the sensor and enables RGB/clear light sensing.
# - Sets the integration time for light sampling.
def init_tcs3472(i2c):
    i2c.writeto_mem(TCS3472_ADDR, 0x80 | 0x00, b'\x03')  
    i2c.writeto_mem(TCS3472_ADDR, 0x80 | 0x01, b'\xD5')  
    time.sleep(0.3)  


# Reads the color values (clear, red, green, blue) from the TCS3472 sensor.
#
# Parameters:
# - i2c (I2C): The I2C object that manages communication with the TCS3472 sensor.
#
# Returns:
# - list[int]: A list of integers representing the color data in the order: [clear, red, green, blue].
#
# Details:
# - Reads two bytes for each color channel (clear, red, green, blue) from the sensor's data registers.
def read_color_values(i2c):
    clear = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x14, 2), 'little')
    red = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x16, 2), 'little')
    green = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x18, 2), 'little')
    blue = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x1A, 2), 'little')
    
    return [clear, red, green, blue]


# Calculates the average color values over a specified number of measurements.
#
# Parameters:
# - num_measurements (int): Number of measurements to take and average.
#
# Returns:
# - list[int]: A list of integers representing the average values for the clear, red, green, and blue color channels.
#
# Details:
# - Reads color values multiple times and computes the average for each color channel.
def average_measurements(num_measurements):
    totals = [0, 0, 0, 0]
    for _ in range(num_measurements):
        color_values = read_color_values(i2c)
        totals = [total + value for total, value in zip(totals, color_values)]
        time.sleep(0.1)
    
    # Durchschnitt berechnen
    averages = [int(total / num_measurements) for total in totals]
    return averages


# Reads the color sensor data from all three channels of the PCA9548A multiplexer and returns the average color values for each channel.
#
# Parameters:
# - num_measurements (int): Number of measurements to take per sensor channel.
#
# Returns:
# - list[tuple[str, list[int]]]: A list of tuples, each containing:
#   - The sensor name from CHANNEL_NAMES.
#   - A list of integers representing the average color values for that sensor.
#
# Details:
# - For each channel:
#   1. Selects the channel using select_channel.
#   2. Initializes the sensor with init_tcs3472.
#   3. Takes measurements using average_measurements.
def read_all_sensors(num_measurements):
    results = []
    for channel in range(3):
        select_channel(i2c, channel)
        init_tcs3472(i2c)
        averages = average_measurements(num_measurements)
        results.append((CHANNEL_NAMES[channel], averages))
    return results
