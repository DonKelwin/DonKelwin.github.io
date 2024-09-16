import Resistance_Meter
from time import sleep
import sys

if __name__ == '__main__':
    try:
        resistance_meter_1 = Resistance_Meter.ResistanceMeter(0, 1, True)
        
        while True:
            resistance_meter_1.read_voltage_ads()
            sleep(1)
    except KeyboardInterrupt:
        print("Got CTL+c")
        sys.exit()