import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TxType} from '../constant';
import {
    IIdentityCertificateStruct,
    IIdentityPubKeyStruct,
    IIdentityStruct, IUpDateIdentityCredentials,
} from '../types/schemaTypes/identity.interface';
import {getTimestamp} from '../util/util';
@Injectable()

export class IdentityTaskService {
    constructor(
        @InjectModel('Identity') private identityTaskModel: any,
        @InjectModel('Pubkey') private pubkeyModel: any,
        @InjectModel('Certificate') private certificateModel: any,
        @InjectModel('Tx') private txModel: any,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    handleCreateIdentity(item: any, value: any) {
        const insertData: IIdentityStruct = {
            id: value.msg.id,
            owner: value.msg.owner,
            credentials: value.msg.credentials,
            'create_block_height': item.height,
            'create_block_time': item.time,
            'create_tx_hash': item.tx_hash,
            'update_block_height': item.height,
            'update_block_time': item.time,
            'update_tx_hash': item.tx_hash,
            'create_time':getTimestamp(),
            'update_time':getTimestamp(),
        }
        return insertData
    }

    handlePubkey(item: any, value: any, index: number) {
        const pubkeyData: IIdentityPubKeyStruct = {
            id: value.msg.id,
            pubkey: {
                pubkey: value.msg.pubkey[0].pubkey,
                algorithm: value.msg.pubkey[0].algorithm,
            },
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return pubkeyData

    }

    handleCertificate(item: any, value: any, index: number) {
        const certificateData: IIdentityCertificateStruct = {
            id: value.msg.id,
            certificate: value.msg.certificate,
            hash: item.tx_hash,
            height: item.height,
            time: item.time,
            'msg_index': index,
            create_time:getTimestamp(),
        }
        return certificateData
    }
    handleUpdateIdentity(item: any, value: any) {
        let updateData: IUpDateIdentityCredentials
        if (value.msg.credentials) {
            updateData = {
                id: value.msg.id,
                credentials: value.msg.credentials,
                'update_block_height': item.height,
                'update_block_time': item.time,
                'update_tx_hash': item.tx_hash,
                'update_time':getTimestamp()
            }
        } else {
            updateData = {
                id: value.msg.id,
                'update_block_height': item.height,
                'update_block_time': item.time,
                'update_tx_hash': item.tx_hash,
                'update_time':getTimestamp()
            }
        }
        return updateData
    }

    async doTask(): Promise<void> {
        // const height: number = await this.identityTaskModel.queryHeight() || 0
        const height: number =  0

        const txlist = await this.txModel.queryListByCreateAndUpDateIdentity(height)
        const identityInsertData: any = [], identityUpdateData: any = [], pubkeyInsertData: any = [],
            certificateInsertData: any = []
        txlist.forEach(item => {
            item.msgs.forEach(async (value: any, msgIndex: number) => {
                if (value.type === TxType.create_identity) {
                    //ex_sync_identity identity
                    const insertData:IIdentityStruct = await this.handleCreateIdentity(item, value)
                    identityInsertData.push(insertData)

                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData:IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData:IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }
                } else if (value.type === TxType.update_identity) {

                    //ex_sync_identity update identity
                    const updateData = this.handleUpdateIdentity(item, value)
                    identityUpdateData.push(updateData)

                    //ex_sync_identity_pubkey   pubkey
                    if (value.msg.pubkey) {
                        const pubkeyData:IIdentityPubKeyStruct = await this.handlePubkey(item, value, msgIndex)
                        pubkeyInsertData.push(pubkeyData)
                    }

                    // ex_sync_identity_certificate certificate
                    if (value.msg.certificate) {
                        const certificateData:IIdentityCertificateStruct = await this.handleCertificate(item, value, msgIndex)
                        certificateInsertData.push(certificateData)
                    }
                }
            })
        })
        const session = await this.identityTaskModel.startSession()
        session.startTransaction()
        try {
          await this.pubkeyModel.insertPubkey(pubkeyInsertData,session)
          await this.identityTaskModel.insertIdentityInfo(identityInsertData,session)
          await this.certificateModel.insertCertificate(certificateInsertData,session)
         /* identityUpdateData.forEach( async (item:IUpDateIdentityCredentials) => {
              await this.identityTaskModel.updateIdentityInfo(item)
          })*/
        await session.commitTransaction();
            session.endSession()
            console.log("+++++++++++++++++++++++++++++++++++++++++")
      }catch (e) {
            await session.abortTransaction()
            session.endSession()
            console.log(e,"===========================================")
      }finally {
            // session.endSession()
            console.log('------------------------')
        }
  }
}
// const session = await mongoose.startSession();
// session.startTransaction();
/*
try {
    let hobbyItem = new SysHobbyModel({
        'label': label,
        'img': img
    })
    let hobby_id = hobbyItem['_id'];
    let hobyyListItem = [];
    item.forEach((ele) => {
        let name = ele['name'];
        let sys_language_id = ele['sys_language_id'];
        let abb = ele['abb'];
        hobyyListItem.push(
          {
              'hobby_id': hobby_id,
              'sys_language_id': sys_language_id,
              'abb': abb,
              'name': name
          }
        )
    });
// const opts = { session, new: true };
// const A = await hobbyItem.save(opts);
// const B = await SysHobbyListModel.insertMany(hobyyListItem, opts);
// await session.commitTransaction();
// session.endSession();
*/
