import pywemo
import os, sys, time
import numpy as np
import pandas as pd

data = pd.read_csv('node23fordemo.csv',index_col=0,header=0)

devices = pywemo.discover_devices()

for d in devices:
    if d.model_name=='Bridge':
        lights = dict(zip(['solar','shape','batt'],d.Lights.values()))
    if d.model_name=='Socket':
        switch = d
        switch.off()

lights['batt'].turn_off()


n = data.index[-1]+1

maxVals = data.abs().max(axis=0)
maxBrightness = 255

oldBattCharging = (data.loc[0,'batt']<0)

oldSwitchState = False
bulb_output = data / maxVals * maxBrightness

raw_input("Press Enter to continue...")

for i in range(n):
    loopLength = 3 # seconds
    startTime = time.time()
    print("pywemo loop at hour %s"%(i+1))
    
    currentSwitchState = bool(bulb_output.loc[i,'defer'])
    battCharging = (bulb_output.loc[i,'batt']<0)
    
    if currentSwitchState != oldSwitchState:
        try:
            print("Switch toggled")
            switch.toggle()                
            oldSwitchState = currentSwitchState
        except:
            pass

    if oldBattCharging != battCharging:
        if battCharging:
            lights['batt'].set_temperature(kelvin=6500,transition=0.01,delay=False)
        else:
            lights['batt'].set_temperature(kelvin=2700,transition=0.01,delay=False)
        # oldBattCharging = battCharging
        
    for type in ['solar','shape','batt']:
        try:
            lights[type].turn_on(level=abs(bulb_output.loc[i,type]),transition=0.01,force_update=True)
        except:
            print("Error setting light")
            pass

    dt = time.time() - startTime
    print(dt)
    sleepDuration = max(loopLength - dt,0)
    print(sleepDuration)
    time.sleep(sleepDuration)