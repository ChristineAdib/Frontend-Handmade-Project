import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../auth/models/api-response.model';
import { PagedResult } from '../../models/paged-result';
import {
  CustomRequestDetailDto,
  CustomRequestSummaryDto,
  GeneratedDesignDto,
  SellerRecommendationDto,
  CustomOfferDto,
  ProjectWorkspaceDto,
  CreateCustomRequestCommand,
  SaveConfigurationCommand,
  CheckoutCustomRequestCommand,
  CreateSellerOfferCommand,
  ProductType,
  WizardStep,
  CreateCustomServiceCommand,
  CustomServiceDto
} from '../models/custom-studio.models';

@Injectable({
  providedIn: 'root'
})
export class CustomStudioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.domain}/api/custom-studio`;
  private isDemoMode = environment.demoMode || false;

  resolveImageUrl(url: string | null | undefined): string {
    if (!url) return 'assets/placeholder-doll.png';
    let normalized = url.replace(/\\/g, '/');
    
    // Normalize localhost URLs to use the current environment's API URL
    const localhostRegex = /^https?:\/\/localhost:\d+/i;
    if (localhostRegex.test(normalized)) {
      normalized = normalized.replace(localhostRegex, environment.apiUrl);
    }
    
    if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('//') || normalized.startsWith('data:image')) {
      return normalized;
    }
    const cleanUrl = normalized.startsWith('/') ? normalized.substring(1) : normalized;
    return `${environment.apiUrl}/${cleanUrl}`;
  }

  // #region Mock Database (localStorage) for Demo Mode

  private getMockDatabase(): CustomRequestDetailDto[] {
    const data = localStorage.getItem('handora_demo_db');
    if (data) {
      return JSON.parse(data);
    }
    const seed: CustomRequestDetailDto[] = [
      {
        id: 'e1111111-2222-3333-4444-555555555555',
        productType: 'CrochetDoll',
        status: 'Paid',
        wizardStep: 'Review',
        generationCount: 1,
        targetBudget: 500,
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        selectedDesignId: 'd1111111-2222-3333-4444-555555555555',
        selectedSellerId: 's1111111-2222-3333-4444-555555555555',
        selectedSellerName: "Aunt Nadia's Crochet Corner",
        buyerId: 'buyer-user-id',
        buyerName: 'Demo Buyer',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        referenceImageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg',
        customConfiguration: {
          id: 'c1111111-2222-3333-4444-555555555555',
          productType: 'CrochetDoll',
          configurationDataJson: JSON.stringify({
            gender: 'Female',
            size: 'Medium (20cm)',
            bodyType: 'Chibi',
            skinTone: 'Fair',
            hairStyle: 'Braids',
            hairColor: 'Blonde',
            outfitStyle: 'Princess Dress',
            outfitColors: ['Pink', 'White']
          })
        },
        generatedDesigns: [
          {
            id: 'd1111111-2222-3333-4444-555555555555',
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg',
            prompt: 'chibi crochet princess doll, braids hair, pastel pink gown',
            provider: 'Google Image Gen 3',
            generationTimeMs: 1200,
            matchingScore: 94.2,
            isSelected: true,
            isSaved: true,
            isDownloaded: false,
            patternStepsMarkdown: '### Princess Doll Amigurumi Pattern\n- Rnd 1: 6 sc in Magic Ring\n- Rnd 2: inc in every st (12)\n- Rnd 3: [1 sc, inc] x6 (18)\n- Rnd 4: [2 sc, inc] x6 (24)\n- Rnd 5-10: sc around'
          }
        ],
        sellerRecommendations: [
          {
            id: 'r1111111-2222-3333-4444-555555555555',
            shopId: 's1111111-2222-3333-4444-555555555555',
            shopName: "Aunt Nadia's Crochet Corner",
            matchingScore: 98.4,
            reason: 'Specializes in chibi princess styling and has 4.9 stars.',
            estimatedPrice: 480,
            estimatedDeliveryDays: 5
          }
        ],
        customOffers: [
          {
            id: 'o1111111-2222-3333-4444-555555555555',
            customRequestId: 'e1111111-2222-3333-4444-555555555555',
            shopId: 's1111111-2222-3333-4444-555555555555',
            shopName: "Aunt Nadia's Crochet Corner",
            price: 480,
            deliveryTimeDays: 5,
            revisionsAllowed: 2,
            attachments: [],
            notes: 'I would love to stitch this princess doll for you! I will use high-quality organic cotton yarn.',
            status: 'Accepted',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        projectWorkspace: {
          id: 'w1111111-2222-3333-4444-555555555555',
          customRequestId: 'e1111111-2222-3333-4444-555555555555',
          selectedOfferId: 'o1111111-2222-3333-4444-555555555555',
          status: 'Initiated',
          milestoneStep: 1, // Sourcing Materials
          paymentStatus: 'Paid',
          chatConversationId: 'chat-11111111-2222-3333-4444-555555555555',
          timelineEntries: []
        }
      },
      {
        id: 'e2222222-2222-3333-4444-555555555555',
        productType: 'CrochetDoll',
        status: 'OfferSent',
        wizardStep: 'Review',
        generationCount: 1,
        targetBudget: 400,
        deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        selectedDesignId: 'd2222222-2222-3333-4444-555555555555',
        buyerId: 'buyer-user-id',
        buyerName: 'Demo Buyer',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        referenceImageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/couple.jpg',
        customConfiguration: {
          id: 'c2222222-2222-3333-4444-555555555555',
          productType: 'CrochetDoll',
          configurationDataJson: JSON.stringify({
            gender: 'Male',
            size: 'Small (15cm)',
            bodyType: 'Standard',
            skinTone: 'Tan',
            hairStyle: 'Short Curly',
            hairColor: 'Black',
            outfitStyle: 'Sailor Boy Hat & Suit',
            outfitColors: ['Blue', 'White']
          })
        },
        generatedDesigns: [
          {
            id: 'd2222222-2222-3333-4444-555555555555',
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/couple.jpg',
            prompt: 'crochet sailor boy doll, curly hair, blue white stripes',
            provider: 'Google Image Gen 3',
            generationTimeMs: 1450,
            matchingScore: 89.5,
            isSelected: true,
            isSaved: true,
            isDownloaded: false,
            patternStepsMarkdown: '### Sailor Doll Amigurumi Pattern\n- Rnd 1: 6 sc in MR\n- Rnd 2: inc x6 (12)\n- Rnd 3-8: sc around (12)\n- Rnd 9: Color change to Sailor Blue...'
          }
        ],
        sellerRecommendations: [
          {
            id: 'r2222222-2222-3333-4444-555555555555',
            shopId: 's2222222-2222-3333-4444-555555555555',
            shopName: "Yasmine Crafty Studio",
            matchingScore: 92.1,
            reason: 'Great experience with male cartoon character styles.',
            estimatedPrice: 380,
            estimatedDeliveryDays: 6
          }
        ],
        customOffers: [
          {
            id: 'o2222222-2222-3333-4444-555555555555',
            customRequestId: 'e2222222-2222-3333-4444-555555555555',
            shopId: 's2222222-2222-3333-4444-555555555555',
            shopName: "Yasmine Crafty Studio",
            price: 390,
            deliveryTimeDays: 6,
            revisionsAllowed: 3,
            attachments: [],
            notes: 'I can complete this cute sailor boy doll quickly. I have ready materials!',
            status: 'Pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'e3333333-2222-3333-4444-555555555555',
        productType: 'CrochetDoll',
        status: 'Completed',
        wizardStep: 'Review',
        generationCount: 1,
        targetBudget: 600,
        deadlineDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        selectedDesignId: 'd3333333-2222-3333-4444-555555555555',
        selectedSellerId: 's2222222-2222-3333-4444-555555555555',
        selectedSellerName: "Yasmine Crafty Studio",
        buyerId: 'buyer-user-id',
        buyerName: 'Demo Buyer',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        referenceImageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/dog.jpg',
        customConfiguration: {
          id: 'c3333333-2222-3333-4444-555555555555',
          productType: 'CrochetDoll',
          configurationDataJson: JSON.stringify({
            gender: 'Female',
            size: 'Large (30cm)',
            bodyType: 'Classic',
            skinTone: 'Espresso',
            hairStyle: 'Ponytail',
            hairColor: 'Auburn',
            outfitStyle: 'Forest Elf Green Tunic',
            outfitColors: ['Green', 'Brown']
          })
        },
        generatedDesigns: [
          {
            id: 'd3333333-2222-3333-4444-555555555555',
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/dog.jpg',
            prompt: 'crochet elf doll green braids hair, forest theme',
            provider: 'Google Image Gen 3',
            generationTimeMs: 1100,
            matchingScore: 97.1,
            isSelected: true,
            isSaved: true,
            isDownloaded: false,
            patternStepsMarkdown: '### Forest Elf Doll Amigurumi Pattern\n- Rnd 1: 6 sc in Magic Ring...'
          }
        ],
        sellerRecommendations: [
          {
            id: 'r2222222-2222-3333-4444-555555555555',
            shopId: 's2222222-2222-3333-4444-555555555555',
            shopName: "Yasmine Crafty Studio",
            matchingScore: 96.7,
            reason: 'Very active in custom anime character orders.',
            estimatedPrice: 550,
            estimatedDeliveryDays: 7
          }
        ],
        customOffers: [
          {
            id: 'o3333333-2222-3333-4444-555555555555',
            customRequestId: 'e3333333-2222-3333-4444-555555555555',
            shopId: 's2222222-2222-3333-4444-555555555555',
            shopName: "Yasmine Crafty Studio",
            price: 550,
            deliveryTimeDays: 7,
            revisionsAllowed: 1,
            attachments: [],
            notes: 'I will craft this custom forest elf doll using premium organic acrylic yarn.',
            status: 'Accepted',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        projectWorkspace: {
          id: 'w3333333-2222-3333-4444-555555555555',
          customRequestId: 'e3333333-2222-3333-4444-555555555555',
          selectedOfferId: 'o3333333-2222-3333-4444-555555555555',
          status: 'Completed',
          milestoneStep: 5,
          paymentStatus: 'Paid',
          chatConversationId: 'chat-33333333-2222-3333-4444-555555555555',
          timelineEntries: []
        }
      }
    ];
    localStorage.setItem('handora_demo_db', JSON.stringify(seed));
    return seed;
  }

  private saveMockDatabase(db: CustomRequestDetailDto[]) {
    localStorage.setItem('handora_demo_db', JSON.stringify(db));
  }

  // #endregion

  createCustomRequest(command: CreateCustomRequestCommand): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const newRequest: CustomRequestDetailDto = {
        id: `demo-${Math.random().toString(36).substr(2, 9)}`,
        productType: ProductType[command.productType] || 'CrochetDoll',
        status: 'Draft',
        wizardStep: 'Initial',
        generationCount: 0,
        targetBudget: command.targetBudget,
        deadlineDate: command.deadlineDate,
        buyerId: 'buyer-user-id',
        buyerName: 'Demo Buyer',
        createdAt: new Date().toISOString(),
        generatedDesigns: [],
        sellerRecommendations: [],
        customOffers: []
      };
      db.push(newRequest);
      this.saveMockDatabase(db);
      return of({ success: true, message: '', data: newRequest }).pipe(delay(200));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request`, command);
  }

  getCustomRequestDetails(id: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      if (!found) {
        return throwError(() => new Error('Request not found in demo database'));
      }
      return of({ success: true, message: '', data: found }).pipe(delay(200));
    }
    return this.http.get<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}`);
  }

  getBuyerRequests(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<PagedResult<CustomRequestSummaryDto>>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const summaries: CustomRequestSummaryDto[] = db.map(r => ({
        id: r.id,
        productType: r.productType,
        status: r.status,
        generationCount: r.generationCount,
        buyerId: r.buyerId,
        buyerName: r.buyerName,
        createdAt: r.createdAt,
        targetBudget: r.targetBudget,
        deadlineDate: r.deadlineDate
      }));
      const paged: PagedResult<CustomRequestSummaryDto> = {
        items: summaries,
        totalCount: summaries.length,
        pageNumber,
        pageSize,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      };
      return of({ success: true, message: '', data: paged }).pipe(delay(200));
    }
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PagedResult<CustomRequestSummaryDto>>>(`${this.apiUrl}/my-requests`, { params });
  }

  getSellerRequests(shopId: string, pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<PagedResult<CustomRequestSummaryDto>>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const matched = db.filter(r => r.sellerRecommendations.some(rec => rec.shopId === shopId) || r.selectedSellerId === shopId);
      const summaries: CustomRequestSummaryDto[] = matched.map(r => ({
        id: r.id,
        productType: r.productType,
        status: r.status,
        generationCount: r.generationCount,
        buyerId: r.buyerId,
        buyerName: r.buyerName,
        createdAt: r.createdAt,
        targetBudget: r.targetBudget,
        deadlineDate: r.deadlineDate
      }));
      const paged: PagedResult<CustomRequestSummaryDto> = {
        items: summaries,
        totalCount: summaries.length,
        pageNumber,
        pageSize,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      };
      return of({ success: true, message: '', data: paged }).pipe(delay(200));
    }
    const params = new HttpParams()
      .set('shopId', shopId)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<PagedResult<CustomRequestSummaryDto>>>(`${this.apiUrl}/seller/requests`, { params });
  }

  saveConfiguration(id: string, command: SaveConfigurationCommand): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'Configuring';
        db[index].customConfiguration = {
          id: `config-${Math.random().toString(36).substr(2, 9)}`,
          productType: 'CrochetDoll',
          configurationDataJson: command.configurationDataJson
        };
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(200));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.put<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}`, command);
  }

  cancelRequest(id: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const filtered = db.filter(r => r.id !== id);
      this.saveMockDatabase(filtered);
      return of({ success: true, message: '', data: null as any }).pipe(delay(100));
    }
    return this.http.delete<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}`);
  }

  getWizardProgress(id: string): Observable<ApiResponse<string>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      return of({ success: true, message: '', data: found?.wizardStep || 'Initial' }).pipe(delay(100));
    }
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/request/${id}/progress`);
  }

  saveWizardStep(id: string, wizardStep: WizardStep): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].wizardStep = WizardStep[wizardStep] || 'Initial';
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(150));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/step`, {
      requestId: id,
      wizardStep
    });
  }

  uploadReferenceImage(id: string, file: File): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].referenceImageUrl = 'https://res.cloudinary.com/demo/image/upload/w_600/horses.jpg';
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(600));
      }
      return throwError(() => new Error('Request not found'));
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/reference-image`, formData);
  }

  analyzePhotoForDoll(id: string, file: File): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].referenceImageUrl = 'https://res.cloudinary.com/demo/image/upload/w_600/horses.jpg';
        db[index].customConfiguration = {
          id: 'config-id',
          productType: 'CrochetDoll',
          configurationDataJson: JSON.stringify({
            gender: 'Girl',
            size: '20 cm',
            bodyType: 'Standard',
            skinTone: 'Ivory (Very Fair)',
            hair: { style: 'Long', color: 'Chestnut Brown', length: 'Medium' },
            face: { eyebrowStyle: 'Normal', eyeColor: 'Black', smileType: 'Happy', hasFreckles: false, hasBlush: true },
            outfit: { type: 'Casual', desc: 'Casual outfit' },
            accessories: { type: 'None', desc: 'None' },
            personalization: { engravedText: '', font: 'Classic' }
          })
        };
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(1000));
      }
      return throwError(() => new Error('Request not found'));
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/analyze-photo`, formData);
  }

  generateAiImages(id: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'Generating';
        this.saveMockDatabase(db);

        const designs: GeneratedDesignDto[] = [
          {
            id: `design-gen-${Math.random().toString(36).substring(2, 11)}`,
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg',
            prompt: `crochet doll matching ${prompt}`,
            provider: 'Google Image Gen 3',
            generationTimeMs: 1100,
            matchingScore: 89.5,
            isSelected: false,
            isSaved: false,
            isDownloaded: false,
            patternStepsMarkdown: '### Generated Pattern\n- Head: standard spherical amigurumi.'
          },
          {
            id: `design-gen-${Math.random().toString(36).substring(2, 11)}`,
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/couple.jpg',
            prompt: 'Amigurumi crochet princess doll with crown, gold accents',
            provider: 'Google Gemini 1.5 Flash',
            generationTimeMs: 1100,
            matchingScore: 89.2,
            isSelected: false,
            isSaved: false,
            isDownloaded: false,
            patternStepsMarkdown: '### Royal Princess Pattern\n- Head: standard sphere.\n- Accessories: crochet little gold tiara.'
          }
        ];
        
        db[index].generatedDesigns = designs;
        db[index].status = 'Generated';
        db[index].generationCount += 1;
        this.saveMockDatabase(db);
        
        return of({ success: true, message: '', data: db[index] }).pipe(delay(2500));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/generate`, {});
  }

  refineAiImage(id: string, designId: string, prompt: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'Generating';
        this.saveMockDatabase(db);

        const newDesignId = `design-ref-${Math.random().toString(36).substr(2, 9)}`;
        const refinedDesign: GeneratedDesignDto = {
          id: newDesignId,
          imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/wasp.jpg',
          prompt: prompt,
          provider: 'Pollinations.ai (Flux)',
          generationTimeMs: 1800,
          matchingScore: 95.8,
          isSelected: true,
          isSaved: false,
          isDownloaded: false,
          patternStepsMarkdown: `### Refined Pattern\n- Custom prompt: ${prompt}\n- Features updated.`
        };

        db[index].generatedDesigns.forEach(d => d.isSelected = false);
        db[index].generatedDesigns.push(refinedDesign);
        db[index].selectedDesignId = newDesignId;
        db[index].status = 'DesignSelected';
        db[index].generationCount += 1;
        this.saveMockDatabase(db);

        return of({ success: true, message: '', data: db[index] }).pipe(delay(2000));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/refine`, { designId, prompt });
  }

  getGeneratedDesigns(id: string): Observable<ApiResponse<GeneratedDesignDto[]>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      return of({ success: true, message: '', data: found?.generatedDesigns || [] }).pipe(delay(100));
    }
    return this.http.get<ApiResponse<GeneratedDesignDto[]>>(`${this.apiUrl}/request/${id}/designs`);
  }

  selectGeneratedDesign(id: string, designId: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].selectedDesignId = designId;
        db[index].status = 'DesignSelected';
        db[index].generatedDesigns.forEach(d => d.isSelected = (d.id === designId));
        
        db[index].sellerRecommendations = [
          {
            id: `rec-s1-${id}`,
            shopId: 's1111111-2222-3333-4444-555555555555',
            shopName: "Aunt Nadia's Crochet Corner",
            matchingScore: 98.4,
            reason: 'Perfect track record in amigurumi princess dolls.',
            estimatedPrice: 480,
            estimatedDeliveryDays: 5
          },
          {
            id: `rec-s2-${id}`,
            shopId: 's2222222-2222-3333-4444-555555555555',
            shopName: "Yasmine Crafty Studio",
            matchingScore: 92.1,
            reason: 'Highly rated crochet vendor with 4.8 stars.',
            estimatedPrice: 450,
            estimatedDeliveryDays: 6
          }
        ];
        db[index].status = 'SellerMatched';

        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(150));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/designs/${designId}/select`, {});
  }

  saveDesign(id: string, designId: string, command: any): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].generatedDesigns.forEach(d => {
          if (d.id === designId) {
            d.isSaved = true;
          }
        });
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(150));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/designs/${designId}/save`, command);
  }

  getDesignHistory(id: string): Observable<ApiResponse<GeneratedDesignDto[]>> {
    if (this.isDemoMode) {
      return this.getGeneratedDesigns(id);
    }
    return this.http.get<ApiResponse<GeneratedDesignDto[]>>(`${this.apiUrl}/request/${id}/history`);
  }

  getRecommendedSellers(id: string): Observable<ApiResponse<SellerRecommendationDto[]>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      return of({ success: true, message: '', data: found?.sellerRecommendations || [] }).pipe(delay(100));
    }
    return this.http.get<ApiResponse<SellerRecommendationDto[]>>(`${this.apiUrl}/request/${id}/recommended-sellers`);
  }

  createDiscussion(id: string, sellerId: string): Observable<ApiResponse<any>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'Negotiation';
        
        const shopName = sellerId === 's1111111-2222-3333-4444-555555555555' 
          ? "Aunt Nadia's Crochet Corner" 
          : "Yasmine Crafty Studio";
        
        const price = sellerId === 's1111111-2222-3333-4444-555555555555' ? 480 : 450;
        
        db[index].customOffers = [
          {
            id: `offer-${sellerId}`,
            customRequestId: id,
            shopId: sellerId,
            shopName: shopName,
            price: price,
            deliveryTimeDays: 5,
            revisionsAllowed: 2,
            attachments: [],
            notes: `Hello! I would love to make this custom crochet princess doll for you. I have high-quality materials and can ship in 5 days.`,
            status: 'Pending',
            createdAt: new Date().toISOString()
          }
        ];
        db[index].status = 'OfferSent';
        
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: { conversationId: `chat-${sellerId}` } }).pipe(delay(300));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/request/${id}/seller/${sellerId}`, {});
  }

  getSellerOffer(id: string): Observable<ApiResponse<CustomOfferDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      const offer = found?.customOffers[found.customOffers.length - 1];
      if (!offer) {
        return throwError(() => new Error('Offer not found'));
      }
      return of({ success: true, message: '', data: offer }).pipe(delay(100));
    }
    return this.http.get<ApiResponse<CustomOfferDto>>(`${this.apiUrl}/request/${id}/offer`);
  }

  acceptOffer(id: string, offerId: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'OfferAccepted';
        const offerIndex = db[index].customOffers.findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          db[index].customOffers[offerIndex].status = 'Accepted';
          db[index].selectedSellerId = db[index].customOffers[offerIndex].shopId;
          db[index].selectedSellerName = db[index].customOffers[offerIndex].shopName;
        }
        db[index].projectWorkspace = {
          id: `ws-${id}`,
          customRequestId: id,
          selectedOfferId: offerId,
          status: 'Initiated',
          milestoneStep: 1, // Sourcing Materials
          paymentStatus: 'Pending',
          chatConversationId: `chat-${db[index].selectedSellerId}`,
          timelineEntries: []
        };
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(200));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/offer/accept`, {
      requestId: id,
      offerId
    });
  }

  rejectOffer(id: string, offerId: string): Observable<ApiResponse<CustomOfferDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        const offerIndex = db[index].customOffers.findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          db[index].customOffers[offerIndex].status = 'Rejected';
          this.saveMockDatabase(db);
          return of({ success: true, message: '', data: db[index].customOffers[offerIndex] }).pipe(delay(150));
        }
      }
      return throwError(() => new Error('Request or Offer not found'));
    }
    return this.http.post<ApiResponse<CustomOfferDto>>(`${this.apiUrl}/request/${id}/offer/reject`, {
      requestId: id,
      offerId
    });
  }

  requestChanges(id: string, offerId: string, feedback: string): Observable<ApiResponse<CustomOfferDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        const offerIndex = db[index].customOffers.findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          db[index].customOffers[offerIndex].status = 'Negotiation';
          db[index].customOffers[offerIndex].notes += `\n[Buyer feedback]: ${feedback}`;
          this.saveMockDatabase(db);
          return of({ success: true, message: '', data: db[index].customOffers[offerIndex] }).pipe(delay(150));
        }
      }
      return throwError(() => new Error('Request or Offer not found'));
    }
    return this.http.post<ApiResponse<CustomOfferDto>>(`${this.apiUrl}/request/${id}/offer/request-changes`, {
      offerId,
      feedback
    });
  }

  checkout(id: string, command: CheckoutCustomRequestCommand): Observable<ApiResponse<any>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = 'Paid';
        if (db[index].projectWorkspace) {
          db[index].projectWorkspace!.paymentStatus = 'Paid';
          db[index].projectWorkspace!.status = 'Paid';
          db[index].projectWorkspace!.milestoneStep = 2; // Paid/Sourcing materials
        }
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: { orderId: `order-${id}`, status: 'Paid' } }).pipe(delay(1000));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/request/${id}/checkout`, command);
  }

  getWorkspaceDetails(id: string): Observable<ApiResponse<ProjectWorkspaceDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.id === id);
      if (found?.projectWorkspace) {
        return of({ success: true, message: '', data: found.projectWorkspace }).pipe(delay(100));
      }
      return throwError(() => new Error('Workspace not initialized'));
    }
    return this.http.get<ApiResponse<ProjectWorkspaceDto>>(`${this.apiUrl}/request/${id}/workspace`);
  }

  getCustomRequestByConversationId(conversationId: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.projectWorkspace?.chatConversationId === conversationId || r.id === conversationId.replace('chat-', ''));
      if (found) {
        return of({ success: true, message: '', data: found }).pipe(delay(100));
      }
      return throwError(() => new Error('Request not linked to this conversation'));
    }
    return this.http.get<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/conversation/${conversationId}`);
  }

  updateWorkspaceProgress(id: string, milestoneStep: number, trackingNumber?: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1 && db[index].projectWorkspace) {
        db[index].projectWorkspace!.milestoneStep = milestoneStep;
        if (trackingNumber) {
          db[index].projectWorkspace!.trackingNumber = trackingNumber;
        }
        if (milestoneStep === 3) {
          db[index].projectWorkspace!.status = 'InProgress';
          db[index].status = 'InProgress';
        } else if (milestoneStep === 4) {
          db[index].projectWorkspace!.status = 'Shipped';
          db[index].status = 'Shipped';
        }
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(300));
      }
      return throwError(() => new Error('Request or Workspace not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/workspace/progress`, {
      milestoneStep,
      trackingNumber
    });
  }

  uploadWorkspacePhoto(id: string, file: File): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1 && db[index].projectWorkspace) {
        db[index].projectWorkspace!.finalPhotoUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600';
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(600));
      }
      return throwError(() => new Error('Request or Workspace not found'));
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/workspace/photo`, formData);
  }

  confirmWorkspaceDelivery(id: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1 && db[index].projectWorkspace) {
        db[index].projectWorkspace!.status = 'Completed';
        db[index].status = 'Completed';
        db[index].projectWorkspace!.milestoneStep = 5; // Completed
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: db[index] }).pipe(delay(250));
      }
      return throwError(() => new Error('Request or Workspace not found'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/request/${id}/workspace/confirm`, {});
  }

  createSellerOffer(id: string, command: CreateSellerOfferCommand): Observable<ApiResponse<CustomOfferDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        const offer: CustomOfferDto = {
          id: `offer-${Math.random().toString(36).substring(2, 11)}`,
          customRequestId: id,
          shopId: command.shopId,
          shopName: "Your Shop",
          price: command.price,
          deliveryTimeDays: command.deliveryTimeDays,
          revisionsAllowed: command.revisionsAllowed,
          attachments: command.attachments || [],
          notes: command.notes,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        db[index].customOffers.push(offer);
        db[index].status = 'OfferSent';
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: offer }).pipe(delay(200));
      }
      return throwError(() => new Error('Request not found'));
    }
    return this.http.post<ApiResponse<CustomOfferDto>>(`${this.apiUrl}/request/${id}/offer`, command);
  }

  createCustomService(command: CreateCustomServiceCommand): Observable<ApiResponse<CustomServiceDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const index = db.findIndex(r => r.id === command.requestId);
      if (index !== -1) {
        const service: CustomServiceDto = {
          id: `service-${Math.random().toString(36).substring(2, 11)}`,
          title: command.title,
          price: command.price,
          estimatedDeliveryDays: command.estimatedDeliveryDays,
          notes: command.notes,
          status: 'Pending Buyer Approval',
          buyerId: db[index].buyerId,
          sellerId: db[index].selectedSellerId || 'seller-user-id',
          conversationId: `chat-${db[index].selectedSellerId || 'seller-user-id'}`,
          customRequestId: command.requestId,
          generatedDesignId: db[index].selectedDesignId,
          createdAt: new Date().toISOString()
        };
        db[index].customService = service;
        db[index].status = 'OfferSent';
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: service }).pipe(delay(200));
      }
      return throwError(() => new Error('Request not found in demo database'));
    }
    return this.http.post<ApiResponse<CustomServiceDto>>(`${this.apiUrl}/service`, command);
  }

  approveCustomService(serviceId: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.customService?.id === serviceId);
      if (found) {
        found.status = 'OfferAccepted';
        if (found.customService) {
          found.customService.status = 'Approved';
        }
        found.projectWorkspace = {
          id: `ws-${found.id}`,
          customRequestId: found.id,
          selectedOfferId: '',
          status: 'Initiated',
          milestoneStep: 1,
          paymentStatus: 'Pending',
          chatConversationId: `chat-${found.selectedSellerId}`,
          customServiceId: serviceId,
          timelineEntries: []
        };
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: found }).pipe(delay(200));
      }
      return throwError(() => new Error('Service not found in demo database'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/service/${serviceId}/approve`, {});
  }

  rejectCustomService(serviceId: string): Observable<ApiResponse<CustomRequestDetailDto>> {
    if (this.isDemoMode) {
      const db = this.getMockDatabase();
      const found = db.find(r => r.customService?.id === serviceId);
      if (found) {
        found.status = 'Negotiation';
        if (found.customService) {
          found.customService.status = 'Rejected';
        }
        this.saveMockDatabase(db);
        return of({ success: true, message: '', data: found }).pipe(delay(200));
      }
      return throwError(() => new Error('Service not found in demo database'));
    }
    return this.http.post<ApiResponse<CustomRequestDetailDto>>(`${this.apiUrl}/service/${serviceId}/reject`, {});
  }
}
