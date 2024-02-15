/**
 * Copyright 2024 Taylor Caldwell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type APIResponse<T> = Promise<T>;

interface AirdropClaim {
    wallet_address: string;
    fid: string;
    display_name: string;
    amount: string;
    claimed: boolean;
    created_at: string;
    updated_at: string;
}

interface AirdropPoints {
    display_name: string;
    points_multiplier?: number;
    points: string;
}

interface TipAllowance {
    snapshot_date: string;
    user_rank: string;
    wallet_address: string;
    avatar_url: string;
    display_name: string;
    tip_allowance: string;
    remaining_allowance: string; 
}

interface LiquidityMiningPoints {
    username: string;
    points: string;
}

class DegenAPIClient {
    private baseURL: string;

    constructor(baseURL: string = 'https://www.degen.tips/developers') {
        this.baseURL = baseURL;
    }

    private async get<T>(path: string): APIResponse<T> {
        try {
            const response = await fetch(`${this.baseURL}${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json() as T;
        } catch (error) {
            console.error("Failed to fetch data:", error);
            throw error;
        }
    }

    // Airdrop 1
    public getAirdrop1Claims(): APIResponse<AirdropClaim[]> {
        return this.get<AirdropClaim[]>('/api/airdrop1/claims');
    }

    public getAirdrop1Points(address: string): APIResponse<AirdropPoints> {
        return this.get<AirdropPoints>(`/api/airdrop1/points?address=${address}`);
    }

    // Airdrop 2
    public getAirdrop2Points(address: string): APIResponse<AirdropPoints> {
        return this.get<AirdropPoints>(`/api/airdrop2/points?address=${address}`);
    }

    public getAirdrop2TipAllowanceByAddress(address: string): APIResponse<TipAllowance> {
        return this.get<TipAllowance>(`/api/airdrop2/tip-allowance?address=${address}`);
    }

    public getAirdrop2TipAllowanceByFid(fid: number): APIResponse<TipAllowance> {
        return this.get<TipAllowance>(`/api/airdrop2/tip-allowance?fid=${fid}`);
    }

    public getAirdrop2TipAllowances(): APIResponse<TipAllowance[]> {
        return this.get<TipAllowance[]>('/api/airdrop2/tip-allowances');
    }

    // Liquidity Mining
    public getLiquidityMiningPoints(address: string): APIResponse<LiquidityMiningPoints> {
        return this.get<LiquidityMiningPoints>(`/api/liquidity-mining/points?address=${address}`);
    }

    public async getAllAirdropPoints(address: string): Promise<[AirdropPoints[], AirdropPoints[]]> {
        const airdrop1Points = this.getAirdrop1Points(address);
        const airdrop2Points = this.getAirdrop2Points(address);
        return Promise.all([airdrop1Points, airdrop2Points]);
    }

    public async getAllPoints(address: string): Promise<{ airdrop1Points: AirdropPoints[], airdrop2Points: AirdropPoints[], liquidityMiningPoints: LiquidityMiningPoints[] }> {
        const [airdrop1Points, airdrop2Points] = await this.getAllAirdropPoints(address);
        const liquidityPoints = await this.getLiquidityMiningPoints(address);
        return { airdrop1Points, airdrop2Points, liquidityMiningPoints: liquidityPoints };
    }
}

// Example usage:
const degenApiClient = new DegenAPIClient();

degenApiClient.getAllAirdropPoints('0xExampleWalletAddress').then(([airdrop1Points, airdrop2Points]) => {
    console.log('Airdrop 1 Points:', airdrop1Points);
    console.log('Airdrop 2 Points:', airdrop2Points);
});

degenApiClient.getAllPoints('0xExampleWalletAddress').then(({ airdrop1Points, airdrop2Points, liquidityMiningPoints }) => {
    console.log('Airdrop 1 Points:', airdrop1Points);
    console.log('Airdrop 2 Points:', airdrop2Points);
    console.log('Liquidity Mining Points:', liquidityMiningPoints);
});