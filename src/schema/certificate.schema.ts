import * as mongoose from 'mongoose'
import { IListStruct } from '../types';
import { IdentityPubKeyAndCertificateReqDto } from '../dto/Identity.dto';
import { IIdentityCertificateStruct } from '../types/schemaTypes/identity.interface';
import { getTimestamp } from '../util/util';

export const CertificateSchema = new mongoose.Schema({
  id:String,
  certificate:String,
  hash: String,
  height: Number,
  time: Number,
  'msg_index': Number,
  create_time:Number
})
CertificateSchema.index({id: 1,'msg_index':1},{unique: true})

CertificateSchema.statics = {
  async insertCertificate(certificateData,session){
    await this.insertMany(certificateData,{ ordered: false },{session})
  },
  async queryCertificate(query:IdentityPubKeyAndCertificateReqDto):Promise<IListStruct>{
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
