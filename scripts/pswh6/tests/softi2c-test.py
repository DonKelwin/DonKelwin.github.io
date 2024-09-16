from machine import I2C, Pin, SoftI2C


SDA = Pin(14)
SCL = Pin(15)

i2c = SoftI2C(scl=Pin(15), sda=Pin(14))

print('I2C SCANNER')
devices = i2c.scan()

if len(devices) == 0:
  print("No i2c device !")
else:
  print('i2c devices found:', len(devices))

  for device in devices:
    print("I2C hexadecimal address: ", hex(device))