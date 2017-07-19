MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;

//Create admins
create (:Admin {adminId: '1', email: 'test@localhost.localdomain'});
create (:Admin {adminId: '2', email: 'test2@localhost.localdomain'});
create (:Admin {adminId: '3', email: 'test3@localhost.localdomain'});

//Create networking platforms
match (admin:Admin {adminId: '2'})
merge (:NetworkingPlatform {platformId: '1', name: 'Elyoos'})<-[:IS_ADMIN]-(admin);
match (admin:Admin {adminId: '3'})
merge (:NetworkingPlatform {platformId: '2', name: 'Transition Zürich'})<-[:IS_ADMIN]-(admin);

//Create organizations
match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '1', name: 'sinndrin genossenschaft'})-[:STATUS]->(:Status);
match (org:Organization {organizationId: '1'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

//Create projects an link them to an organization
match (org:Organization {organizationId: '1'})
merge (org)-[:HAS]->(project:Project {projectId: '1', name: 'Technikbegeisterung mit sinndrin', created: 1500036113})-[:STATUS]->(:Status);
match (project:Project {projectId: '1'}), (admin:Admin {adminId: '1'})
merge (project)<-[:IS_ADMIN]-(admin);
match (org:Organization {organizationId: '1'})
merge (org)-[:HAS]->(project:Project {projectId: '2', name: 'Coworking, Bürogemeinschaft, Atelierräume', created: 1500036113})-[:STATUS]->(:Status);
match (project:Project {projectId: '2'}), (admin:Admin {adminId: '1'})
merge (project)<-[:IS_ADMIN]-(admin);