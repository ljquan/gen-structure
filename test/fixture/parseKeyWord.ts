/**
 * 关键词：'if', 'switch', 'with', 'catch', 'for', 'while', 'void'等不被误判 
 */

let hello = 1;
if (hello === 1) {
    switch (hello) {
        case 1:
            hello = 2;
        default:
            break;
    }
}
try {
    // some comment
    const undef = void (0);
    for (let i = 1; i < 10; i++) {
        // @ts-ignore
        with ({ a: 1 }) {
            console.log(this.a)
        }
    }


}catch(e){
    console.error(e);
}
