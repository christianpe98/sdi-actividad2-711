function stopIntervals(intervalConversaciones,intervalChat){
    if(intervalConversaciones!=undefined)
    {
        clearInterval(intervalConversaciones);
    }
    if(intervalChat!=undefined)
    {
        clearInterval(intervalChat);
    }
}
