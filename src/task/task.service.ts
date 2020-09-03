import { Injectable } from '@nestjs/common';
import { Cron,Interval } from '@nestjs/schedule';
import { TxTaskService } from './tx.task.service';
import { DenomTaskService } from './denom.task.service';
import { NftTaskService } from './nft.task.service';
import { TaskDispatchService } from '../service/task.dispatch.service';
import { TaskEnum } from '../constant';
import { getIpAddress } from '../util/util';
import { cfg } from '../config/config';
import { TaskCallback } from '../types/task.interface';
import { ValidatorsTaskService } from './validators.task.service';
import { Logger } from '../logger';
import { IdentityTaskService } from './idnetity.task.service';

@Injectable()
export class TasksService {

    constructor(
        private readonly denomTaskService: DenomTaskService,
        private readonly nftTaskService: NftTaskService,
        private readonly taskDispatchService: TaskDispatchService,
        private readonly txTaskService: TxTaskService,
        private readonly validatorsTaskService: ValidatorsTaskService,
        private readonly identityTaskService: IdentityTaskService
    ) {
        this[`${TaskEnum.denom}_timer`] = null;
        this[`${TaskEnum.nft}_timer`] = null;
        this[`${TaskEnum.txServiceName}_timer`] = null;
        this[`${TaskEnum.validators}_timer`] = null;
        this[`${TaskEnum.identity}_timer`] = null;
    }
    @Cron(cfg.taskCfg.executeTime.denom)
    //@Cron('50 * * * * *')
    async syncDenoms() {
        this.handleDoTask(TaskEnum.denom, this.denomTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.nft)
    //@Cron('58 * * * * *')
    async syncNfts() {
        this.handleDoTask(TaskEnum.nft, this.nftTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.txServiceName)
    //@Cron('20 * * * * *')
    async syncTxServiceName() {
        this.handleDoTask(TaskEnum.txServiceName, this.txTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.validators)
    //@Cron('03 * * * * *')
    async syncValidators() {
        this.handleDoTask(TaskEnum.validators, this.validatorsTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.faultTolerance)
    //@Cron('18 * * * * *')
    async taskDispatchFaultTolerance() {
        this.taskDispatchService.taskDispatchFaultTolerance();
    }
    //@Cron('1 * * * * *')
    // @Cron(cfg.taskCfg.executeTime.identity)
    @Interval(5000)
    async syncIdentity() {
        this.handleDoTask(TaskEnum.identity,this.identityTaskService.doTask)
    }
    async handleDoTask(taskName: TaskEnum, doTask: TaskCallback) {
        const needDoTask: boolean = await this.taskDispatchService.needDoTask(taskName);
        Logger.log(`the ip ${getIpAddress()} (process pid is ${process.pid}) should do task ${taskName}? ${needDoTask}`);
        if (needDoTask) {
            try {
                //因为一般情况下定时任务执行时间要小于心跳率, 为防止heartbeat_update_time一直不被更新,
                //所以在任务开始之前先更新一下heartbeat_update_time;
                await this.updateHeartbeatUpdateTime(taskName);
                const beginTime: number = new Date().getTime();
                this[`${taskName}_timer`] = setInterval(() => {
                    this.updateHeartbeatUpdateTime(taskName);
                }, cfg.taskCfg.interval.heartbeatRate);
                await doTask();
                //weather task is completed successfully, lock need to be released;
                const unlock: boolean = await this.taskDispatchService.unlock(taskName);
                Logger.log(`the ip ${getIpAddress()} (process pid is ${process.pid}) has released the lock ${taskName}? ${unlock}`);
                if (this[`${taskName}_timer`]) {
                    clearInterval(this[`${taskName}_timer`]);
                }
                Logger.log(`from task service ${taskName} successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);
            } catch (e) {
                console.log(e)
                await this.taskDispatchService.unlock(taskName);
                if (this[`${taskName}_timer`]) {
                    clearInterval(this[`${taskName}_timer`]);
                }
            }
        }
    }

    async updateHeartbeatUpdateTime(name: TaskEnum): Promise<void> {
        await this.taskDispatchService.updateHeartbeatUpdateTime(name);
    }
}


