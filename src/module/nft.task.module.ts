import {Module } from '@nestjs/common';
import {NftTaskService} from '../task/nft.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {NftSchema} from '../schema/nft.schema';
import { NftHttp } from '../http/lcd/nft.http';
import { DenomSchema } from '../schema/denom.schema';
import { TxSchema } from '../schema/tx.schema';
import { TaskSchema } from '../schema/task.schema';
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Nft',
            schema: NftSchema,
            collection: 'ex_sync_nft'
        },{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom'
        },{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },{
            name: 'TaskSchema',
            schema: TaskSchema,
            collection: 'sync_task'
        }])
    ],
    providers:[NftTaskService, NftHttp],
    exports:[NftTaskService]
})
export class NftTaskModule{}