export const datetime = (dat: string) => {
    let inicio = dat;
    inicio = inicio.replace('T', ' ');

    if(!inicio.includes(':')){
        inicio + ':00';
    }
    else if(inicio.split(':')[0].length == 2){
        inicio += ':00';
    }

    return inicio;
}