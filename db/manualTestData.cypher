MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;

//Create admins
create (:Admin {adminId: '1', email: 'test@localhost.localdomain'});
create (:Admin {adminId: '2', email: 'test2@localhost.localdomain'});
create (:Admin {adminId: '3', email: 'test3@localhost.localdomain'});
create (:Admin {adminId: '4', email: 'test4@localhost.localdomain'});
create (:Admin {adminId: '5', email: 'test5@localhost.localdomain'});

//Create networking platforms
match (admin:Admin {adminId: '2'})
merge (:NetworkingPlatform {platformId: '1', name: 'Elyoos'})<-[:IS_ADMIN]-(admin);
match (admin:Admin {adminId: '3'})
merge (:NetworkingPlatform {platformId: '2', name: 'Transition Zürich'})<-[:IS_ADMIN]-(admin);

//Create organizations
match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '1', name: 'sinndrin genossenschaft'});
match (org:Organization {organizationId: '1'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '2', name: 'Slow Food Youth'});
match (org:Organization {organizationId: '2'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '3', name: 'adsfa asdfa asdfsdasdf asdfasdfa asdfasdf jölene asdf jöqlwe qwelknqwe nqwelj nqwelröj nqweölj nqweklrjöl'});
match (org:Organization {organizationId: '3'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '4', name: 'Bio für Jede'});
match (org:Organization {organizationId: '4'}), (np:NetworkingPlatform {platformId: '2'})
merge (np)-[:CREATED]->(org);