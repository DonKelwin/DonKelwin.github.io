import machine
import ADS1115
import sys
from time import sleep

# Variables initialization
chan_1 = 0
chan_2 = 0

if __name__ == '__main__':
    try:
        # Initialization of the ADC
        ADS1115.init(0x48, 3, 4, False)
        print("start")
        while True:
            # Output of the data from channel 0 of the ADC
            print(ADS1115.read(chan_1))
            print(ADS1115.read(chan_2))
            # Output of the read out and converted data of channel 0 of the ADC
            print(str(ADS1115.raw_to_v(ADS1115.read(chan_1))) + " V")
            print(str(ADS1115.raw_to_v(ADS1115.read(chan_2))) + " V")
            sleep(1)

    except KeyboardInterrupt:
        sys.exit()