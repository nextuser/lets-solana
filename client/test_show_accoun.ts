import {get_pg, show_account ,getKeypair} from "./utils";
let keypair = getKeypair();
let pg = get_pg(keypair);

show_account(pg.connection,'2UAW8SukrPnMAVjuPF3PngshNwGm6Xtt9dRH5b5bV7kQ');