/**
 * ProductCatalogService - Invocable Apex for Agentforce product queries.
 * Called by Agentforce topics to search and retrieve product data
 * from Commerce Cloud via Connect API or direct SOQL.
 */
global with sharing class ProductCatalogService {

    public class ProductSearchRequest {
        @InvocableVariable(required=false)
        public String query;

        @InvocableVariable(required=false)
        public String category;

        @InvocableVariable(required=false)
        public String maison;

        @InvocableVariable(required=false)
        public String subBrand;

        @InvocableVariable(required=false)
        public Integer maxResults;
    }

    public class ProductResult {
        @InvocableVariable
        public String productId;

        @InvocableVariable
        public String name;

        @InvocableVariable
        public String brand;

        @InvocableVariable
        public String category;

        @InvocableVariable
        public Decimal price;

        @InvocableVariable
        public String description;

        @InvocableVariable
        public String imageUrl;

        @InvocableVariable
        public String maison;

        @InvocableVariable
        public String subBrand;

        @InvocableVariable
        public Decimal rating;

        @InvocableVariable
        public Boolean isTravel;

        @InvocableVariable
        public Boolean inStock;
    }

    @InvocableMethod(label='Search Product Catalog' description='Searches the product catalog based on criteria and returns JSON')
    public static List<String> searchProducts(List<ProductSearchRequest> requests) {
        List<String> allResults = new List<String>();

        for (ProductSearchRequest request : requests) {
            List<ProductResult> results = executeSearch(request);
            allResults.add(JSON.serialize(results));
        }

        return allResults;
    }

    private static List<ProductResult> executeSearch(ProductSearchRequest request) {
        String soql = 'SELECT Id, Name, Brand__c, Category__c, Price__c, Description__c, ' +
                       'Image_URL__c, Maison__c, Sub_Brand__c, Rating__c, Is_Travel__c, In_Stock__c ' +
                       'FROM Product2 WHERE IsActive = true AND Category__c != null';

        List<String> conditions = new List<String>();

        if (String.isNotBlank(request.category)) {
            conditions.add('Category__c = :category');
        }
        if (String.isNotBlank(request.maison)) {
            conditions.add('Maison__c = :maison');
        }
        if (String.isNotBlank(request.query)) {
            conditions.add('(Name LIKE :searchQuery)');
        }

        if (!conditions.isEmpty()) {
            soql += ' AND ' + String.join(conditions, ' AND ');
        }

        Integer maxResults = request.maxResults != null ? request.maxResults : 10;
        soql += ' ORDER BY Rating__c DESC LIMIT ' + maxResults;

        String category = request.category;
        String maison = request.maison;
        String searchQuery = request.query != null ? '%' + request.query + '%' : '';

        List<Product2> products = Database.query(soql);
        List<ProductResult> results = new List<ProductResult>();

        for (Product2 product : products) {
            ProductResult result = new ProductResult();
            result.productId = product.Id;
            result.name = product.Name;
            result.brand = (String) product.get('Brand__c');
            result.category = (String) product.get('Category__c');
            result.price = (Decimal) product.get('Price__c');
            result.description = (String) product.get('Description__c');
            result.imageUrl = (String) product.get('Image_URL__c');
            result.maison = (String) product.get('Maison__c');
            result.subBrand = (String) product.get('Sub_Brand__c');
            result.rating = (Decimal) product.get('Rating__c');
            result.isTravel = (Boolean) product.get('Is_Travel__c');
            result.inStock = (Boolean) product.get('In_Stock__c');
            results.add(result);
        }

        return results;
    }
}
