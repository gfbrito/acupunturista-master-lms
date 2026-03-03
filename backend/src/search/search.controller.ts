import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async search(@Query('q') query: string) {
        return this.searchService.search(query);
    }
}
