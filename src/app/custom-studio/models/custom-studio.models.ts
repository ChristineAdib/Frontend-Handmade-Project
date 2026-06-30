export enum ProductType {
  CrochetDoll = 1,
  Pottery = 2,
  Candle = 3,
  Embroidery = 4,
  GiftBox = 5
}

export enum CustomRequestStatus {
  Draft = 1,
  Configuring = 2,
  ReadyForGeneration = 3,
  Generating = 4,
  Generated = 5,
  DesignSelected = 6,
  SellerMatched = 7,
  Negotiation = 8,
  OfferSent = 9,
  OfferAccepted = 10,
  PaymentPending = 11,
  Paid = 12,
  InProgress = 13,
  Completed = 14,
  Cancelled = 15,
  Rejected = 16
}

export enum WizardStep {
  Initial = 1,
  Styling = 2,
  Details = 3,
  Review = 4
}

export interface CustomConfiguration {
  gender?: string;
  size?: string;
  bodyType?: string;
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  hairLength?: string;
  hairTexture?: string;
  hairBangs?: boolean;
  eyeColor?: string;
  smileType?: string;
  eyebrowStyle?: string;
  hasFreckles?: boolean;
  hasBlush?: boolean;
  outfitCategory?: string;
  outfitStyle?: string;
  outfitColors?: string[];
  accessories?: string[];
  personalizationName?: string;
  personalizationMessage?: string;
  personalizationDate?: string;
  personalizationFont?: string;
  personalizationTextColor?: string;
  referenceImageUrl?: string;
}

export interface CustomConfigurationDto {
  id: string;
  productType: string;
  configurationDataJson: string; // Contains serialized CustomConfiguration
}

export interface GeneratedDesignDto {
  id: string;
  imageUrl: string;
  prompt: string;
  provider: string;
  generationTimeMs: number;
  matchingScore: number;
  isSelected: boolean;
  isSaved: boolean;
  isDownloaded: boolean;
  patternStepsMarkdown: string;
  designSummaryJson?: string;
}

export interface SellerRecommendationDto {
  id: string;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  matchingScore: number;
  reason: string;
  estimatedPrice: number;
  estimatedDeliveryDays: number;
}

export interface CustomOfferDto {
  id: string;
  customRequestId: string;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  price: number;
  deliveryTimeDays: number;
  revisionsAllowed: number;
  attachments: string[];
  notes: string;
  status: string;
  createdAt: string;
  
  conversationId?: string;
  buyerId?: string;
  sellerId?: string;
  designId?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  orderId?: string;
  workspaceId?: string;
}

export interface ProjectWorkspaceDto {
  id: string;
  customRequestId: string;
  selectedOfferId: string;
  status: string;
  milestoneStep: number;
  paymentStatus: string;
  chatConversationId: string;
  orderId?: string;
  customServiceId?: string;
  timelineEntries?: any[];
  finalPhotoUrl?: string;
  trackingNumber?: string;
}

export interface CustomRequestDetailDto {
  id: string;
  conversationId?: string;
  productType: string;
  status: string;
  wizardStep: string;
  generationCount: number;
  targetBudget?: number;
  deadlineDate?: string;
  selectedDesignId?: string;
  selectedDesign?: GeneratedDesignDto;
  selectedSellerId?: string;
  selectedSellerName?: string;
  buyerId: string;
  buyerName: string;
  createdAt: string;
  updatedAt?: string;
  referenceImageUrl?: string;
  customConfiguration?: CustomConfigurationDto;
  generatedDesigns: GeneratedDesignDto[];
  sellerRecommendations: SellerRecommendationDto[];
  customOffers: CustomOfferDto[];
  projectWorkspace?: ProjectWorkspaceDto;
  customService?: CustomServiceDto;
}

export interface CreateSellerOfferCommand {
  requestId: string;
  shopId: string;
  price: number;
  deliveryTimeDays: number;
  revisionsAllowed: number;
  notes: string;
  attachments?: string[];
  status?: string;
  offerId?: string;
}

export interface CreateCustomServiceCommand {
  requestId: string;
  shopId: string;
  title: string;
  price: number;
  estimatedDeliveryDays: number;
  notes: string;
}

export interface CustomServiceDto {
  id: string;
  title: string;
  price: number;
  estimatedDeliveryDays: number;
  notes: string;
  status: string;
  buyerId: string;
  sellerId: string;
  conversationId?: string;
  customRequestId: string;
  generatedDesignId?: string;
  createdAt: string;
}

export interface CustomRequestSummaryDto {
  id: string;
  productType: string;
  status: string;
  generationCount: number;
  buyerId: string;
  buyerName: string;
  createdAt: string;
  targetBudget?: number;
  deadlineDate?: string;
}

export interface CreateCustomRequestCommand {
  productType: ProductType;
  targetBudget?: number;
  deadlineDate?: string;
}

export interface UpdateWizardStepCommand {
  requestId: string;
  wizardStep: WizardStep;
}

export interface SaveConfigurationCommand {
  requestId: string;
  productType: ProductType;
  configurationDataJson: string;
}

export interface CheckoutCustomRequestCommand {
  requestId: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
  deliveryMethodId: string;
  couponCode?: string;
  notes?: string;
}

export function mapFlatToNested(flat: CustomConfiguration): any {
  const genderMap: { [key: string]: number } = {
    'Female': 1, 'Girl': 1, 'female': 1, 'girl': 1,
    'Male': 2, 'Boy': 2, 'male': 2, 'boy': 2,
    'NonBinary': 3, 'nonbinary': 3
  };

  const hairStyleMap: { [key: string]: number } = {
    'Bald': 0, 'bald': 0,
    'Straight': 1, 'straight': 1,
    'Curly': 2, 'curly': 2,
    'Wavy': 3, 'wavy': 3,
    'Braids': 4, 'braids': 4,
    'Ponytail': 5, 'ponytail': 5,
    'Buns': 6, 'buns': 6,
    'Afro': 7, 'afro': 7,
    'Pixie': 8, 'pixie': 8
  };

  const bodyTypeMap: { [key: string]: number } = {
    'Standard': 1, 'standard': 1, 'Normal': 1, 'normal': 1,
    'Chibi': 2, 'chibi': 2,
    'Slender': 3, 'slender': 3, 'Slim': 3, 'slim': 3,
    'Plump': 4, 'plump': 4, 'Chubby': 4, 'chubby': 4
  };

  const outfitTypeMap: { [key: string]: number } = {
    'Casual': 1, 'casual': 1, 'Shirt': 1, 'shirt': 1, 'Overalls': 1, 'overalls': 1,
    'Elegant': 2, 'elegant': 2, 'Formal': 2, 'formal': 2, 'Dress': 2, 'dress': 2,
    'Winter': 3, 'winter': 3, 'Summer': 3, 'summer': 3, 'Seasonal': 3, 'seasonal': 3, 'Hoodie': 3, 'hoodie': 3,
    'Traditional': 5, 'traditional': 5,
    'Graduation': 4, 'graduation': 4, 'Doctor': 4, 'doctor': 4, 'Engineer': 4, 'engineer': 4, 'Teacher': 4, 'teacher': 4, 'Uniform': 4, 'uniform': 4,
    'Bride': 6, 'bride': 6, 'Groom': 6, 'groom': 6, 'FancyDress': 6, 'fancydress': 6, 'Fancy Dress': 6,
    'Baby': 1, 'baby': 1, 'Custom': 1, 'custom': 1
  };

  const accessoryTypeMap: { [key: string]: number } = {
    'None': 0, 'none': 0,
    'Hat': 1, 'hat': 1,
    'Glasses': 2, 'glasses': 2,
    'Bag': 3, 'bag': 3,
    'Scarf': 4, 'scarf': 4,
    'Flower': 5, 'flower': 5,
    'Toy': 6, 'toy': 6, 'Pet': 6, 'pet': 6,
    'Watch': 7, 'watch': 7, 'Headphones': 7, 'headphones': 7, 'WeaponOrInstrument': 7, 'weaponorinstrument': 7
  };

  const fontTypeMap: { [key: string]: number } = {
    'Classic': 1, 'classic': 1,
    'Modern': 2, 'modern': 2, 'Arial': 2, 'arial': 2,
    'Script': 3, 'script': 3,
    'Playful': 4, 'playful': 4,
    'Handwritten': 5, 'handwritten': 5
  };

  const genderVal = genderMap[flat.gender || ''] || 0;
  const bodyTypeVal = bodyTypeMap[flat.bodyType || ''] || 1;
  
  const hairStyleVal = hairStyleMap[flat.hairStyle || ''] || 1;
  const hair = {
    Style: hairStyleVal,
    Color: flat.hairColor || 'Brown',
    Length: flat.hairLength || 'Medium'
  };

  const face = {
    EyeShape: flat.eyebrowStyle || 'Round',
    EyeColor: flat.eyeColor || 'Black',
    Smile: flat.smileType || 'Smile',
    Freckles: !!flat.hasFreckles,
    Blush: !!flat.hasBlush
  };

  const outfitTypeVal = outfitTypeMap[flat.outfitCategory || ''] || 1;
  const outfit = {
    Type: outfitTypeVal,
    Description: flat.outfitStyle || 'Default Outfit'
  };

  let accessoryTypeVal = 0;
  let accessoryDesc = 'None';
  if (flat.accessories && flat.accessories.length > 0) {
    const firstAcc = flat.accessories[0];
    accessoryTypeVal = accessoryTypeMap[firstAcc] || 0;
    accessoryDesc = flat.accessories.join(', ');
  }
  const accessories = {
    Type: accessoryTypeVal,
    Description: accessoryDesc
  };

  const fontVal = fontTypeMap[flat.personalizationFont || ''] || 1;
  const personalization = {
    LabelText: flat.personalizationName || '',
    Font: fontVal
  };

  return {
    Gender: genderVal,
    Size: flat.size || '20 cm',
    BodyType: bodyTypeVal,
    SkinTone: flat.skinTone || 'Fair',
    Hair: hair,
    Face: face,
    Outfit: outfit,
    Accessories: accessories,
    Personalization: personalization,
    ReferenceImageUrl: flat.referenceImageUrl || null,
    AdditionalNotes: flat.personalizationMessage || ''
  };
}

export function mapNestedToFlat(nested: any): CustomConfiguration {
  const genderNames = ['Unspecified', 'Girl', 'Boy', 'NonBinary'];
  const hairStyleNames = ['Bald', 'Straight', 'Curly', 'Wavy', 'Braids', 'Ponytail', 'Buns', 'Afro', 'Pixie'];
  const bodyTypeNames = ['Unspecified', 'Standard', 'Chibi', 'Slender', 'Plump'];
  const outfitNames = ['Unspecified', 'Casual', 'Elegant', 'Winter', 'Summer', 'Traditional', 'Graduation'];
  const accessoryNames = ['None', 'Hat', 'Glasses', 'Bag', 'Scarf', 'Flower', 'Toy', 'Watch'];
  const fontNames = ['Unspecified', 'Classic', 'Modern', 'Script', 'Playful', 'Handwritten'];

  const gender = nested.Gender !== undefined ? (genderNames[nested.Gender] || 'Girl') : 'Girl';
  const bodyType = nested.BodyType !== undefined ? (bodyTypeNames[nested.BodyType] || 'Standard') : 'Standard';
  
  const hair = nested.Hair || {};
  const hairStyle = hair.Style !== undefined ? (hairStyleNames[hair.Style] || 'Straight') : 'Straight';
  
  const face = nested.Face || {};
  
  const outfit = nested.Outfit || {};
  const outfitCategory = outfit.Type !== undefined ? (outfitNames[outfit.Type] || 'Casual') : 'Casual';
  
  const acc = nested.Accessories || {};
  const mainAccName = acc.Type !== undefined ? (accessoryNames[acc.Type] || 'None') : 'None';
  const accessories = mainAccName !== 'None' ? [mainAccName] : [];

  const pers = nested.Personalization || {};
  const personalizationFont = pers.Font !== undefined ? (fontNames[pers.Font] || 'Classic') : 'Classic';

  return {
    gender,
    size: nested.Size || '20 cm',
    bodyType,
    skinTone: nested.SkinTone || 'Fair',
    hairStyle,
    hairColor: hair.Color || 'Brown',
    hairLength: hair.Length || 'Medium',
    hairTexture: 'Straight',
    hairBangs: false,
    eyeColor: face.EyeColor || 'Black',
    smileType: face.Smile || 'Smile',
    eyebrowStyle: face.EyeShape || 'Round',
    hasFreckles: !!face.Freckles,
    hasBlush: !!face.Blush,
    outfitCategory,
    outfitStyle: outfit.Description || '',
    outfitColors: [],
    accessories,
    personalizationName: pers.LabelText || '',
    personalizationMessage: nested.AdditionalNotes || '',
    personalizationDate: '',
    personalizationFont,
    personalizationTextColor: 'Black',
    referenceImageUrl: nested.ReferenceImageUrl || null
  };
}

export interface DesignSummary {
  gender?: string;
  height?: string;
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  outfit?: string;
  accessories?: string;
  personalization?: string;
  referenceImage?: string;
  designImage?: string;
  face?: string;
}

export function parseDesignSummary(design: any): DesignSummary {
  if (!design) return {};
  
  let result: DesignSummary = {};
  if (design.designSummaryJson) {
    try {
      const parsed = JSON.parse(design.designSummaryJson);
      result = {
        gender: String(parsed.Gender || parsed.gender || ''),
        height: String(parsed.Height || parsed.height || parsed.Size || parsed.size || ''),
        skinTone: String(parsed.SkinTone || parsed.skinTone || ''),
        hairStyle: String(parsed.HairStyle || parsed.hairStyle || (parsed.Hair || parsed.hair)?.Style || ''),
        hairColor: String(parsed.HairColor || parsed.hairColor || (parsed.Hair || parsed.hair)?.Color || ''),
        outfit: String(parsed.OutfitStyle || parsed.outfitStyle || parsed.Outfit || parsed.outfit || (parsed.Outfit || parsed.outfit)?.Description || ''),
        accessories: String(parsed.Accessories || parsed.accessories || (parsed.Accessories || parsed.accessories)?.Description || ''),
        personalization: String(parsed.Personalization || parsed.personalization || (parsed.Personalization || parsed.personalization)?.LabelText || parsed.AdditionalNotes || ''),
        referenceImage: String(parsed.ReferenceImage || parsed.referenceImage || parsed.ReferenceImageUrl || parsed.referenceImageUrl || ''),
        face: String(parsed.Face || parsed.face || 'Normal')
      };
    } catch (e) {
      console.error('Failed to parse design summary json:', e);
    }
  }
  
  result.designImage = design.imageUrl || result.designImage;
  return result;
}
