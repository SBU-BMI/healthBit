console.log('bestFit.js loaded')

//

function anime(){
    
    setInterval(function(){
        var sps = $('table >>>>>')
        var n = sps.length
        var i = Math.round((n-1)*Math.random())
        var v = Math.round(100*Math.random())
        sps[i].style.width=v+'%'
        sps[i].textContent=v+' '+sps[i].id
        //console.log(i)
    },1000)

}

anime()