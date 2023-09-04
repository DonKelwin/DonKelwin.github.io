
class PC {
    "ID" = 0;
    "WireIsIdleForMe" = true;
    "ImSending" = false;
    "ImReceiving" = false;
    "TimeToSendForMeter" = 0;
    "FirstBitArivesForMeter" = 0;
    "SendingComplete" = true;
    "Paused" = false;
    "JamFinished" = true;
    "BackOffFinished" = true;
    constructor(meter, byte, Mbit) {
        this.meter = meter;
        this.byte = byte;
        this.Mbit = Mbit;
    }


}

let Singleton = (function () {
    let instance;

    function createInstance() {
        let array = new Array(2);
        return array;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();





function initialize(meter, byte, Mbit, form) {
    if (meter == 0 || byte == 0 || Mbit == 0) {
        alert("Fill in the empty fields!")
    }
    else {
        document.getElementById("checkbox-1").disabled = true;
        if (form.frame.checked == true) {
                document.getElementById("play").disabled = true;
                const pcOne = new PC(meter, byte, Mbit);
                pcOne.ID = 1;
                pcOne.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (meter / 200000000);
                pcOne.FirstBitArivesForMeter = meter / 200000000;
    
                const pcTwo = new PC(meter, byte, Mbit);
                pcTwo.ID = 2;
                pcTwo.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (meter / 200000000);
                pcTwo.FirstBitArivesForMeter = meter / 200000000;
    
                Singleton.getInstance[0] = pcOne;
                Singleton.getInstance[1] = pcTwo;
                gsap.fromTo('.network', { opacity: 0 }, { opacity: 1, duration: 1, y: -150 });
            
         } else {
            if ((2 * (meter / 200000000) * Mbit * 1000000) > (byte * 8)) {
                alert("Minimum frame size too small! You will need at least " + (2 * (meter / 200000000) * Mbit * 1000000) / 8 + " byte  " + (2 * (meter / 200000000) * Mbit * 1000000) + "(bit) with your settings (to send to every node)!")
            }
            else {
                document.getElementById("play").disabled = true;
                const pcOne = new PC(meter, byte, Mbit);
                pcOne.ID = 1;
                pcOne.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (meter / 200000000);
                pcOne.FirstBitArivesForMeter = meter / 200000000;
    
                const pcTwo = new PC(meter, byte, Mbit);
                pcTwo.ID = 2;
                pcTwo.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (meter / 200000000);
                pcTwo.FirstBitArivesForMeter = meter / 200000000;
    
                Singleton.getInstance[0] = pcOne;
                Singleton.getInstance[1] = pcTwo;
                gsap.fromTo('.network', { opacity: 0 }, { opacity: 1, duration: 1, y: -150 });
            }
         }
      
    }
}


function startNetwork1() {
    let firstPC = Singleton.getInstance[0];
    let secondPC = Singleton.getInstance[1];
    if (firstPC.ID != undefined) {
        sending(firstPC, secondPC);
    }
}

function startNetwork2() {
    let firstPC = Singleton.getInstance[0];
    let secondPC = Singleton.getInstance[1];
    if (firstPC.ID != undefined) {
        sending(secondPC, firstPC);
    }
}

async function sending(from, to) {
    if (from.SendingComplete) {
        from.SendingComplete = false;
        console.log("PC " + from.ID + ": i want to send " + Math.floor(Date.now() / 1000));
        let n = 1;
        while (n <= 10) {
            await waitForWireIsIdle(from);
            console.log("PC " + from.ID + ": wire is Idle for Me " + Math.floor(Date.now() / 1000));
            console.log("PC " + from.ID + ": starting sending " + Math.floor(Date.now() / 1000));
            from.ImSending = true;
            await pause(from);
            AnimateSensing(from);
            await pause(from);
            AnimateWire(from, to);
            console.log("PC " + from.ID + ": i will send " + ((from.TimeToSendForMeter) * 200000 + from.FirstBitArivesForMeter * 200000) + " seconds");
            await waitForCollisionDetected(Math.floor(Date.now() / 1000), (Math.floor(Date.now() / 1000) + (from.TimeToSendForMeter - (0.8*from.FirstBitArivesForMeter)) * 200000), from); //!!!!
            DeAnimateSensing(from);
            if (from.ImReceiving) {
                await pause(from);
                console.log("PC " + from.ID + ": collision detected it is the " + n + "th collision " + Math.floor(Date.now() / 1000));
                AnimateCollision(from, to);
                let r = BinaryPotentialBackoff(from, n);
                await pause(from);
                await sendJam(from, r[1], r[2]);
                from.ImSending = false;
                await WaitingBinaryPotentialBackoff(from, r[0], r[1]);
                n = n + 1;
            } else {
                from.ImSending = false;
                DeAnimateWire(from, to);
                await pause(from);
                AnimateSendingComplete(from);
                break;
            }
        }
    }
}



async function WaitingBinaryPotentialBackoff(from, r, i) {
    from.BackOffFinished = false;
    console.log("PC " + from.ID + ": i rolled  " + i + " and i must wait  " + r*200000 + " seconds " + Math.floor(Date.now() / 1000));
    AnimateBackoff(from);
    gsap.fromTo('.action', { }, {duration: r* 200000, onComplete: BackOffFinished, onCompleteParams: [from]});
    await BackOffComplete(from);
    DeAnimateBackoff(from);
}

async function BackOffComplete (from){
    if (from.BackOffFinished == false) {
        await sleepPropagationTime(20);
        await BackOffComplete(from);
    }
    console.log("PC " + from.ID + ": BackOffFInished " + (Math.floor(Date.now() / 1000)));
}

function BackOffFinished(from) {
    from.BackOffFinished = true;
}

function BinaryPotentialBackoff(from, n) {
    let k = Math.min(n, 10)
    let i = Math.round(Math.random() * (Math.pow(2, k) - 1));
    let r = (i * (2 * (from.FirstBitArivesForMeter)));
    console.log("PC " + from.ID + ": my range is from 0 to " + (Math.pow(2, k) - 1) + " Time:" + Math.floor(Date.now() / 1000));
    return [r,i,(Math.pow(2, k) - 1)];
}

function AnimateSendingComplete(from) {
    if (from.ID == 1) {
        gsap.fromTo('#left_check', { opacity: 1 }, { opacity: 0, duration: 4 });
    } else {
        gsap.fromTo('#right_check', { opacity: 1 }, { opacity: 0, duration: 4 });
    }
}

function DeAnimateBackoff(from) {
    if (from.ID == 1) {
        gsap.to('#left_backoff', { opacity: 0 });
        gsap.to("#left_WaitingTime", {opacity: 0, duration: 0});
    } else {
        gsap.to('#right_backoff', { opacity: 0 });
        gsap.to("#right_WaitingTime", {opacity: 0, duration: 0});
    }
}

function AnimateBackoff(from) {
    if (from.ID == 1) {
        gsap.to('#left_backoff', { opacity: 1 });
    } else {
        gsap.to('#right_backoff', { opacity: 1 });
    }
}

function AnimateCollision(from, to) {
    if (from.ID == 1) {
        gsap.fromTo('#left_danger', { opacity: 1 }, { opacity: 0, duration: 3 });
        animateBackLeftToRight(from, to);

    } else {
        gsap.fromTo('#right_danger', { opacity: 1 }, { opacity: 0, duration: 3 });
        animateBackRightToLeft(from, to);
    }
}

function AnimateWire(from, to) {
    if (from.ID == 1) {
        animateLeftToRight(from, to);
    } else {
        animateRightToLeft(from, to);
    }
}

function DeAnimateWire(from, to) {
    if (from.ID == 1) {
        animateBackLeftToRightForCompletion(from, to);
    } else {
        animateBackRightToLeftForCompletion(from, to);
    }
}

function DeAnimateSensing(from) {
    if (from.ID == 1) {
        gsap.to('#left_Sense', { opacity: 0 });
    } else {
        gsap.to('#right_Sense', { opacity: 0 });
    }
}

function AnimateSensing(from) {
    if (from.ID == 1) {
        gsap.to('#left_Sense', { opacity: 1 });
    } else {
        gsap.to('#right_Sense', { opacity: 1 });
    }
}

function AnimateWaitingForIdle(from) {
    if (from.ID == 1) {

        gsap.to('#left_Idle', { opacity: 1 });


    } else {
        gsap.to('#right_Idle', { opacity: 1 });

    }
}

function DeanimateWaitingForIdle(from) {
    if (from.ID == 1) {

        gsap.to('#left_Idle', { opacity: 0 });


    } else {
        gsap.to('#right_Idle', { opacity: 0 });

    }
}



async function waitForCollisionDetected(startTime, endTime, from) {
    var timeBeforePause = Math.floor(Date.now() / 1000);
    await pause(from);
    var pauseTime= Math.floor(Date.now() / 1000)-timeBeforePause;
    if ((!from.ImReceiving) && (Math.floor(Date.now() / 1000) < endTime+pauseTime)) {
        await sleepPropagationTime(2);
        await waitForCollisionDetected(startTime, endTime+pauseTime, from);
    }
}

function FirstBitArrived(to, from) {
    console.log("PC " + to.ID + ": es hat mich das erste Bit erreicht " + (Math.floor(Date.now() / 1000)));
    to.ImReceiving = true;

}


function LastBitArivedTo(to, endTime) {
    to.ImReceiving = false;
    console.log("PC " + to.ID + ": es hat mich das letzte Bit erreicht " + (Math.floor(Date.now() / 1000)));
}

function SendingComplete (from, to) {
    to.ImReceiving = false;
    console.log("PC " + to.ID + ": es hat mich das letzte Bit erreicht " + (Math.floor(Date.now() / 1000)));
    from.SendingComplete = true;
    console.log("PC " + from.ID + ": sending completed " + Math.floor(Date.now() / 1000));
}

async function sendJam(from, i, maxValue) {
    from.JamFinished = false;
    var t1 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    if (from.ID == 1) {
        t1.to('#left_Jam', { opacity: 1, duration: 0 });
        const elem= document.getElementById("left_RandomValue");
        elem.innerHTML = i;
        const max = document.getElementById("left_max_value_range");
        max.innerHTML = maxValue;
        t1.to("#left_WaitingTime", {opacity: 1, duration: 0}, "<");
    } else {
        t1.to('#right_Jam', { opacity: 1, duration: 0 });
        const elem= document.getElementById("right_RandomValue");
        elem.innerHTML = i;
        const max = document.getElementById("right_max_value_range");
        max.innerHTML = maxValue;
        t1.to("#right_WaitingTime", {opacity: 1, duration: 0}, "<");
    }
    t1.fromTo('.action', { }, {duration: 2* from.FirstBitArivesForMeter * 200000}, "<");
    console.log("PC " + from.ID + ": sending Jam-Signal " + Math.floor(Date.now() / 1000));
    if (from.ID == 1) {
        t1.fromTo('.leftJam', { x: -4, opacity: 0.5 }, { x: 445, ease: "none", duration: from.FirstBitArivesForMeter * 200000 }, ">");
        t1.to('.leftJam', { opacity: 0, duration: 0 });
    } else {
        t1.fromTo('.rightJam', { x: 4, opacity: 0.5 }, { x: -445, ease: "none", duration: from.FirstBitArivesForMeter * 200000 }, ">");
        t1.to('.rightJam', { opacity: 0, duration: 0 });
    }
    t1.fromTo('.action', { }, {ease: "none", duration: from.FirstBitArivesForMeter * 200000});
    if (from.ID == 1) {
       t1.to('#left_Jam', { opacity: 0 , onComplete: JamFinished, onCompleteParams: [from], duration: 0});
    } else {
        t1.to('#right_Jam', { opacity: 0, onComplete: JamFinished, onCompleteParams: [from], duration: 0 });
    }
    await waitToContinue(from);

}


function JamFinished(from) {
    from.JamFinished = true;
}

async function waitToContinue (from){
    if (from.JamFinished == false) {
        await sleepPropagationTime(20);
        await waitToContinue(from);
    }
    console.log("PC " + from.ID + ": Jam Finished " + (Math.floor(Date.now() / 1000)));
}


async function transMissionDelay(to, endTime){
    var timeBeforePause = Math.floor(Date.now() / 1000);
    await pause(to);
    var pauseTime= Math.floor(Date.now() / 1000)-timeBeforePause;
    if ((Math.floor(Date.now() / 1000) < endTime+pauseTime)) {
        await sleepPropagationTime(10);
        await transMissionDelay(to, endTime+pauseTime);
    }}


function sleepPropagationTime(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function animateLeftToRight(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.leftbox', { x: 178, width: 0, opacity: 0.5 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200000, width: 445 , overwrite: true});
    t3.fromTo('.action', { }, { duration: from.FirstBitArivesForMeter * 200000, onComplete: FirstBitArrived, onCompleteParams: [to, from] }, "<");
}

function animateRightToLeft(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.rightbox', { x: -3, width: 0, opacity: 0.5 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200000, width: 445, overwrite: true});
    t3.fromTo('.action', { }, {duration: from.FirstBitArivesForMeter * 200000,  onComplete: FirstBitArrived, onCompleteParams: [to, from] }, "<");

}

function animateBackLeftToRight(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.leftbox', { opacity: 0.5 }, { x: 623,  opacity: 0.5, duration: from.FirstBitArivesForMeter * 200000, ease: "none", overwrite: true});
    t3.fromTo('.action', { }, { duration: from.FirstBitArivesForMeter * 200000,   onComplete: LastBitArivedTo, onCompleteParams: [to, from] },"<");
}

function animateBackRightToLeft(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.rightbox', { x: -3, opacity: 0.5 }, { x: -450,  opacity: 0.5, duration: from.FirstBitArivesForMeter * 200000, ease: "none", overwrite: true});
    t3.fromTo('.action', { }, { duration: from.FirstBitArivesForMeter * 200000,    onComplete: LastBitArivedTo, onCompleteParams: [to, from] },"<");
}

function animateBackLeftToRightForCompletion(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.leftbox', { opacity: 0.5 }, { x: 623,  opacity: 0.5, duration: from.FirstBitArivesForMeter * 200000, ease: "none", overwrite: true});
    t3.fromTo('.action', { }, { duration: from.FirstBitArivesForMeter * 200000,   onComplete: SendingComplete, onCompleteParams: [from, to] },"<");
}

function animateBackRightToLeftForCompletion(from, to) {
    var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    var t2 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
    t3.fromTo('.rightbox', { x: -3, opacity: 0.5 }, { x: -450,  opacity: 0.5, duration: from.FirstBitArivesForMeter * 200000, ease: "none", overwrite: true});
    t3.fromTo('.action', { }, { duration: from.FirstBitArivesForMeter * 200000, onComplete: SendingComplete, onCompleteParams: [from, to]},"<");
}

function stopping() {
    document.getElementById("pause").disabled = true;
    document.getElementById("play").disabled = false;
    Singleton.getInstance[0].Paused=true;
    Singleton.getInstance[1].Paused=true;
    gsap.globalTimeline.pause();
}

function resume() {
    document.getElementById("pause").disabled = false;
    document.getElementById("play").disabled = true;
    Singleton.getInstance[0].Paused=false;
    Singleton.getInstance[1].Paused=false;
    gsap.globalTimeline.play();
}

async function pause(from){
    if (from.Paused) {
        console.log("Es ist pausiert " + (Math.floor(Date.now() / 1000)));
        await sleepPropagationTime(5);
        await pause(from);
    }
}

async function waitForWireIsIdle(from) {
    await pause(from);
    AnimateWaitingForIdle(from);
    if (from.ImSending || from.ImReceiving) {
        await sleepPropagationTime(10);
        console.log(("PC " + from.ID + ": is waiting for idle wire " + Math.floor(Date.now() / 1000)));
        await waitForWireIsIdle(from);
    }
    DeanimateWaitingForIdle(from);
}