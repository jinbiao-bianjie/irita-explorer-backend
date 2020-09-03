import * as mongoose from 'mongoose';
import { IListStruct } from '../types';
import { IdentityPubKeyAndCertificateReqDto } from '../dto/Identity.dto';
import { IIdentityPubKeyStruct } from '../types/schemaTypes/identity.interface';
import { getTimestamp } from '../util/util';

export const PubkeySchema = new mongoose.Schema({
    id: String,
    pubkey: Object,
    hash: String,
    height: String,
    time: String,
    'msg_index': Number,
    create_time:Number
})
PubkeySchema.index({id: 1,'msg_index':1},{unique: true})

PubkeySchema.statics = {
    async insertPubkey (pubkey,session) {
        await this.insertMany(pubkey,{ ordered: false },{session})
    },
    async queryPubkeyList(query:IdentityPubKeyAndCertificateReqDto) :Promise<IListStruct>  {
        const result: IListStruct = {}
        const queryParameters: any = {};
        queryParameters.id = query.id
        result.data = await this.find(queryParameters)
          .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
          .limit(Number(query.pageSize)).sort({'time':-1});

        if (query.useCount && query.useCount == true) {
            result.count = await this.find(queryParameters).countDocuments();
        }
        return result
    }
}
