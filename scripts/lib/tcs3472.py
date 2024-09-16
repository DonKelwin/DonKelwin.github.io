from machine import I2C
import utime

class TCS3472:


    # Initialize the TCS3472 color sensor.
    #
    # Parameters:
    # - i2c (I2C): The I2C interface to communicate with the sensor.
    # - address (int): I2C address of the TCS3472 sensor (default: 0x29).
    def __init__(self, i2c, address=0x29):
        self.i2c = i2c
        self.address = address
        self.initialize()

    
    # Configure the TCS3472 sensor by enabling it, setting power, integration time, and gain.
    def initialize(self):
        # Enable the device
        self.i2c.writeto_mem(self.address, 0x00 | 0x80, b'\x01')
        utime.sleep(0.01)
        # Power ON
        self.i2c.writeto_mem(self.address, 0x00 | 0x80, b'\x03')
        utime.sleep(0.01)
        # Set integration time to 700ms
        self.i2c.writeto_mem(self.address, 0x01 | 0x80, b'\x00')
        utime.sleep(0.01)
        # Set gain to 1x
        self.i2c.writeto_mem(self.address, 0x0F | 0x80, b'\x00')
        utime.sleep(0.01)


    # Read and return color data from the TCS3472 sensor.
    #
    # Returns:
    # - tuple: A tuple containing four values (clear, red, green, blue).
    #     - clear (int): Clear light intensity value.
    #     - red (int): Red light intensity value.
    #     - green (int): Green light intensity value.
    #     - blue (int): Blue light intensity value.
    def read(self):
        data = self.i2c.readfrom_mem(self.address, 0x14 | 0x80, 8)
        clear = data[1] << 8 | data[0]
        red = data[3] << 8 | data[2]
        green = data[5] << 8 | data[4]
        blue = data[7] << 8 | data[6]
        return clear, red, green, blue
