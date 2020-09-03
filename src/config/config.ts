import dotenv from 'dotenv';
dotenv.config();

const {
    LCD_ADDR,
    DB_USER,
    DB_PASSWD,
    DB_ADDR,
    DB_DATABASE,
    NODE_ENV,
    DENOM_EXECUTE_TIME,
    NFT_EXECUTE_TIME,
    TX_SERVICE_NAME_EXECUTE_TIME,
    FAULT_TOLERANCE_EXECUTE_TIME,
    IDENTITY_EXECUTE_TIME,
    SYNC_TX_SERVICE_NAME_SIZE,
    HEARTBEAT_RATE,
    VALIDATORS_EXECTUTE_TIME,
    DisableLog
} = process.env;
export const cfg = {
    env: NODE_ENV,
    disableLog:Boolean(DisableLog=='true'),
    dbCfg: {
        user: 'iris',
        psd: 'irispassword',
        dbAddr: '10.1.4.185:27018',
        dbName: 'explorer-sync',
    },
    serverCfg:{
        lcdAddr:'http://109.244.70.42:1317'
    },
    taskCfg:{
        interval:{
            heartbeatRate:Number(HEARTBEAT_RATE || 10),
        },
        executeTime:{
            denom:DENOM_EXECUTE_TIME || '1 * * * * *',
            nft:NFT_EXECUTE_TIME || '21 * * * * *',
            txServiceName:TX_SERVICE_NAME_EXECUTE_TIME || '30 * * * * *',
            faultTolerance:FAULT_TOLERANCE_EXECUTE_TIME || '41 * * * * *',
            validators:VALIDATORS_EXECTUTE_TIME || '1 * * * * *',
            identity: IDENTITY_EXECUTE_TIME || '1 * * * * *'
        },
        syncTxServiceNameSize: Number(SYNC_TX_SERVICE_NAME_SIZE) || 200,
    }
};

