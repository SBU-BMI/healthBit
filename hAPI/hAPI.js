console.log('hAPI loaded')

hAPI={
    dobra:function(x){
        return 2*x
    },
    connectBtn:function(){ // create connect button
        var img = document.createElement('img')
        img.id='connect-health-data-btn' 
        img.src='https://connect.humanapi.co/assets/button/blue.png'
        return img
    },
    ini:function(){
        console.log('initiatilizng Human API ...')
        
        hAPIdiv.appendChild(this.connectBtn())


    }
}

hAPI.ini()