import * as mongoose from 'mongoose'
import { IIdentityStruct } from '../types/schemaTypes/identity.interface';
import { Logger } from '../logger';
import { ITXWithIdentity } from '../types/schemaTypes/tx.interface';
import { IListStruct } from '../types';
import {
  IdentityByAddressReqDto,
  IdentityInfoReqDto,
  IdentityInfoResDto,
  IdentityResDto,
} from '../dto/Identity.dto';
import { getTimestamp } from '../util/util';

export const IdentitySchema = new mongoose.Schema({
  id: String,
  owner: String,
  credentials: String,
  'create_block_height': Number,
  'create_block_time': Number,
  'create_tx_hash': String,
  'update_block_height': Number,
  'update_block_time': Number,
  'update_tx_hash': String,
  create_time: Number,
  update_time: Number,
})
IdentitySchema.index({id: 1},{unique: true})
IdentitySchema.statics = {
  async queryIdentityList(query:ITXWithIdentity):Promise<IListStruct> {
    const result: IListStruct = {}
    const queryParameters: any = {};
    if(query.search && query.search !== ''){
      //单条件模糊查询使用$regex $options为'i' 不区分大小写
      queryParameters.$or = [
        {id:{ $regex: query.search,$options:'i' }},
        {owner:{ $regex: query.search,$options:'i' }}
      ]
      result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_time':-1});
    }else {
      result.data = await this.find(queryParameters).skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_time':-1})
    }
    if (query.useCount && query.useCount == true) {
      result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
  },

  async queryHeight() {
      const height = await this.findOne({}).sort({'update_block_height': -1})
      const blockHeight = height ? height.update_block_height : 0
      return blockHeight
  },

  async insertIdentityInfo(IdentityInfo,session) {
      await  this.insertMany(IdentityInfo,{ ordered: false },{session})
  },
  // base information
  async updateIdentityInfo(updateIdentityData) {
      if(updateIdentityData.credentials){
        const { id,credentials, update_block_time, update_block_height, update_tx_hash } = updateIdentityData;
        await this.updateOne({id},{credentials,update_block_time,update_block_height,update_tx_hash},(e) => {
          if (e) Logger.error('mongo-error:', e.message);
        });
      }else {
        const { id, update_block_time, update_block_height, update_tx_hash } = updateIdentityData;
        await this.updateOne({id},{update_block_time,update_block_height,update_tx_hash},(e) => {
          if (e) Logger.error('mongo-error:', e.message);
        });
      }
  },
  async queryIdentityInfo(id:IdentityInfoReqDto):Promise<IdentityInfoResDto> {
    const infoData:IdentityInfoResDto = await this.findOne(id)
    return  infoData
  },
  // owner
  async queryIdentityByAddress(query: IdentityByAddressReqDto):Promise<IListStruct>{
    const result: IListStruct = {}
    const queryParameters: any = {};
    queryParameters.owner = query.address

    result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_time':-1});
    if (query.useCount && query.useCount == true) {
      result.count = await this.find(queryParameters).countDocuments();
    }
    return result
  }
}

