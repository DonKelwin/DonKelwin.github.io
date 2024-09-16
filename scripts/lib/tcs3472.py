from machine import I2C
import utime

class TCS3472:
    def __init__(self, i2c, address=0x29):
        self.i2c = i2c
        self.address = address
        self.initialize()

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

    def read(self):
        data = self.i2c.readfrom_mem(self.address, 0x14 | 0x80, 8)
        clear = data[1] << 8 | data[0]
        red = data[3] << 8 | data[2]
        green = data[5] << 8 | data[4]
        blue = data[7] << 8 | data[6]
        return clear, red, green, blue
