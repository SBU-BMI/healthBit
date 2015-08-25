console.log('healthBit.js base library loaded')

// ini
hb = function(){
    // ini
    hb.fitbit() // starting with fitbits

}

hb.fitbit=function(){
    // login fitbit
    if(location.hash.length==0){ // if not returning from login
        location.href='https://www.fitbit.com/oauth2/authorize?client_id=229TL4&redirect_uri='+location.href+'&response_type=token&scope=profile&code=lala'
    }else{
        hb.fitbit.login={}
        location.hash.slice(1).split('&').map(
            function(pp){
                var p = pp.split('=');
                hb.fitbit.login[p[0]]=p[1]
                //console.log(p)
            }
        )
        location.hash=""
        console.log('login',hb.fitbit.login)
    }
    


}

// ini

hb()