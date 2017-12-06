//Create networking platforms

//Set initial admin for networking platform. Additional admins can be added in the management gui.
match (admin:Admin {email: 'test@localhost.localdomain'})
merge (np:NetworkingPlatform {platformId: '1', name: 'Name of networking platform', description: 'Add description',
link: 'https://www.example.org'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: false})
merge (np)-[:EXPORT_RULES]->(exportRules)
create (exportConfig:ExportConfig {adapterType: 'standardNp', npApiUrl: 'https://example.org/tc', token: '123'})
merge (np)-[:EXPORT_CONFIG]->(exportConfig);


//Create categories for the networking platform
create (category:Category {categoryId: '1', idOnPlatform: 'example'})-[:DE]->(:CategoryTranslated {name: 'Beispiel'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Example'});

//Set used categories for networking platform
match (np:NetworkingPlatform {platformId: '1'}), (category:Category)
where category.categoryId IN ['1']
merge (np)-[:ORG_CATEGORY]->(category);