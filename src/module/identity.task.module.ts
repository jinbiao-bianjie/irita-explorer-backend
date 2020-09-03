import { IdentitySchema } from '../schema/identity.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityTaskService } from '../task/idnetity.task.service';
import { TxSchema } from '../schema/tx.schema';
import { PubkeySchema } from '../schema/pubkey.schema';
import { CertificateSchema } from '../schema/certificate.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: 'Identity',
      schema: IdentitySchema,
      collection: 'ex_sync_identity_1'
    },{
      name: 'Tx',
      schema: TxSchema,
      collection: 'sync_tx'
    },{
      name: 'Pubkey',
      schema: PubkeySchema,
      collection: 'ex_sync_identity_pubkey_1'
    },{
      name:'Certificate',
      schema: CertificateSchema,
      collection:'ex_sync_identity_certificate_1'
    }])
  ],
  providers:[IdentityTaskService],
  exports:[IdentityTaskService]
})
export class IdentityTaskModule{}
