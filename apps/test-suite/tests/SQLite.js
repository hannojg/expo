'use strict';

import { Asset } from 'expo-asset';
import * as FS from 'expo-file-system';
import { Platform } from 'expo-modules-core';
import * as SQLite from 'expo-sqlite';

export const name = 'SQLite';

// TODO: Only tests successful cases, needs to test error cases like bad database name etc.
export function test(t) {
  t.describe('SQLite', () => {
    t.it('should be able to drop + create a table, insert, query', async () => {
      const db = SQLite.openDatabase('test.db');
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            const nop = () => {};
            const onError = (tx, error) => reject(error);

            tx.executeSql('DROP TABLE IF EXISTS Users;', [], nop, onError);
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS Users (user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64), k INT, j REAL);',
              [],
              nop,
              onError
            );
            tx.executeSql(
              'INSERT INTO Users (name, k, j) VALUES (?, ?, ?)',
              ['Tim Duncan', 1, 23.4],
              nop,
              onError
            );
            tx.executeSql(
              'INSERT INTO Users (name, k, j) VALUES ("Manu Ginobili", 5, 72.8)',
              [],
              nop,
              onError
            );
            tx.executeSql(
              'INSERT INTO Users (name, k, j) VALUES ("Nikhilesh Sigatapu", 7, 42.14)',
              [],
              nop,
              onError
            );

            tx.executeSql(
              'SELECT * FROM Users',
              [],
              (tx, results) => {
                t.expect(results.rows.length).toEqual(3);
                t.expect(results.rows.item(0).j).toBeCloseTo(23.4);
              },
              onError
            );
          },
          reject,
          resolve
        );
      });

      if (Platform.OS !== 'web') {
        const { exists } = await FS.getInfoAsync(`${FS.documentDirectory}SQLite/test.db`);
        t.expect(exists).toBeTruthy();
      }
    });

    if (Platform.OS !== 'web') {
      t.it(
        'should work with a downloaded .db file',
        async () => {
          await FS.downloadAsync(
            Asset.fromModule(require('../assets/asset-db.db')).uri,
            `${FS.documentDirectory}SQLite/downloaded.db`
          );

          const db = SQLite.openDatabase('downloaded.db');
          await new Promise((resolve, reject) => {
            db.transaction(
              (tx) => {
                const onError = (tx, error) => reject(error);
                tx.executeSql(
                  'SELECT * FROM Users',
                  [],
                  (tx, results) => {
                    t.expect(results.rows.length).toEqual(3);
                    t.expect(results.rows._array[0].j).toBeCloseTo(23.4);
                  },
                  onError
                );
              },
              reject,
              resolve
            );
          });
          db._db.close();
        },
        30000
      );
    }

    t.it('should be able to recreate db from scratch by deleting file', async () => {
      {
        const db = SQLite.openDatabase('test.db');
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              const nop = () => {};
              const onError = (tx, error) => reject(error);

              tx.executeSql('DROP TABLE IF EXISTS Users;', [], nop, onError);
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Users (user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64), k INT, j REAL);',
                [],
                nop,
                onError
              );
              tx.executeSql(
                'INSERT INTO Users (name, k, j) VALUES (?, ?, ?)',
                ['Tim Duncan', 1, 23.4],
                nop,
                onError
              );

              tx.executeSql(
                'SELECT * FROM Users',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(1);
                },
                onError
              );
            },
            reject,
            resolve
          );
        });
      }

      if (Platform.OS !== 'web') {
        const { exists } = await FS.getInfoAsync(`${FS.documentDirectory}SQLite/test.db`);
        t.expect(exists).toBeTruthy();
      }

      if (Platform.OS !== 'web') {
        await FS.deleteAsync(`${FS.documentDirectory}SQLite/test.db`);
        const { exists } = await FS.getInfoAsync(`${FS.documentDirectory}SQLite/test.db`);
        t.expect(exists).toBeFalsy();
      }

      {
        const db = SQLite.openDatabase('test.db');
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              const nop = () => {};
              const onError = (tx, error) => reject(error);

              tx.executeSql('DROP TABLE IF EXISTS Users;', [], nop, onError);
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Users (user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64), k INT, j REAL);',
                [],
                nop,
                onError
              );
              tx.executeSql(
                'SELECT * FROM Users',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(0);
                },
                onError
              );

              tx.executeSql(
                'INSERT INTO Users (name, k, j) VALUES (?, ?, ?)',
                ['Tim Duncan', 1, 23.4],
                nop,
                onError
              );
              tx.executeSql(
                'SELECT * FROM Users',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(1);
                },
                onError
              );
            },
            reject,
            resolve
          );
        });
      }
    });

    t.it('should maintain correct type of potentialy null bind parameters', async () => {
      const db = SQLite.openDatabase('test.db');
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            const nop = () => {};
            const onError = (tx, error) => reject(error);

            tx.executeSql('DROP TABLE IF EXISTS Nulling;', [], nop, onError);
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS Nulling (id INTEGER PRIMARY KEY NOT NULL, x NUMERIC, y NUMERIC)',
              [],
              nop,
              onError
            );
            tx.executeSql('INSERT INTO Nulling (x, y) VALUES (?, ?)', [null, null], nop, onError);
            tx.executeSql('INSERT INTO Nulling (x, y) VALUES (null, null)', [], nop, onError);

            tx.executeSql(
              'SELECT * FROM Nulling',
              [],
              (tx, results) => {
                t.expect(results.rows.item(0).x).toBeNull();
                t.expect(results.rows.item(0).y).toBeNull();
                t.expect(results.rows.item(1).x).toBeNull();
                t.expect(results.rows.item(1).y).toBeNull();
              },
              onError
            );
          },
          reject,
          resolve
        );
      });

      if (Platform.OS !== 'web') {
        const { exists } = await FS.getInfoAsync(`${FS.documentDirectory}SQLite/test.db`);
        t.expect(exists).toBeTruthy();
      }
    });

    // Do not try to test PRAGMA statements support in web
    // as it is expected to not be working.
    // See https://stackoverflow.com/a/10298712
    if (Platform.OS !== 'web') {
      t.it('should support PRAGMA statements', async () => {
        const db = SQLite.openDatabase('test.db');
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              const nop = () => {};
              const onError = (tx, error) => reject(error);

              tx.executeSql('DROP TABLE IF EXISTS SomeTable;', [], nop, onError);
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS SomeTable (id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64));',
                [],
                nop,
                onError
              );
              // a result-returning pragma
              tx.executeSql(
                'PRAGMA table_info(SomeTable);',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(2);
                  t.expect(results.rows.item(0).name).toEqual('id');
                  t.expect(results.rows.item(1).name).toEqual('name');
                },
                onError
              );
              // a no-result pragma
              tx.executeSql('PRAGMA case_sensitive_like = true;', [], nop, onError);
              // a setter/getter pragma
              tx.executeSql('PRAGMA user_version = 123;', [], nop, onError);
              tx.executeSql(
                'PRAGMA user_version;',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(1);
                  t.expect(results.rows.item(0).user_version).toEqual(123);
                },
                onError
              );
            },
            reject,
            resolve
          );
        });
      });
    }

    t.it('should return correct rowsAffected value', async () => {
      const db = SQLite.openDatabase('test.db');
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            const nop = () => {};
            const onError = (tx, error) => reject(error);

            tx.executeSql('DROP TABLE IF EXISTS Users;', [], nop, onError);
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS Users (user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64));',
              [],
              nop,
              onError
            );
            tx.executeSql(
              'INSERT INTO Users (name) VALUES (?), (?), (?)',
              ['name1', 'name2', 'name3'],
              nop,
              onError
            );
          },
          reject,
          resolve
        );
      });
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            const onError = (tx, error) => reject(error);
            tx.executeSql(
              'DELETE FROM Users WHERE name=?',
              ['name1'],
              (tx, results) => {
                t.expect(results.rowsAffected).toEqual(1);
              },
              onError
            );
            tx.executeSql(
              'DELETE FROM Users WHERE name=? OR name=?',
              ['name2', 'name3'],
              (tx, results) => {
                t.expect(results.rowsAffected).toEqual(2);
              },
              onError
            );
            tx.executeSql(
              // ensure deletion succeedeed
              'SELECT * from Users',
              [],
              (tx, results) => {
                t.expect(results.rows.length).toEqual(0);
              },
              onError
            );
          },
          reject,
          resolve
        );
      });
    });
    if (Platform.OS !== 'web') {
      // It is not expected to work on web, since we cannot execute PRAGMA to enable foreign keys support
      t.it('should return correct rowsAffected value when deleting cascade', async () => {
        const db = SQLite.openDatabase('test.db');
        db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () => {});
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              const nop = () => {};
              const onError = (tx, error) => reject(error);

              tx.executeSql('DROP TABLE IF EXISTS Users;', [], nop, onError);
              tx.executeSql('DROP TABLE IF EXISTS Posts;', [], nop, onError);
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Users (user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(64));',
                [],
                nop,
                onError
              );
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS Posts (post_id INTEGER PRIMARY KEY NOT NULL, content VARCHAR(64), userposted INTEGER, FOREIGN KEY(userposted) REFERENCES Users(user_id) ON DELETE CASCADE);',
                [],
                nop,
                onError
              );
              tx.executeSql(
                'INSERT INTO Users (name) VALUES (?), (?), (?)',
                ['name1', 'name2', 'name3'],
                nop,
                onError
              );

              tx.executeSql(
                'INSERT INTO Posts (content, userposted) VALUES (?, ?), (?, ?), (?, ?)',
                ['post1', 1, 'post2', 1, 'post3', 2],
                nop,
                onError
              );
              tx.executeSql('PRAGMA foreign_keys=off;', [], nop, onError);
            },
            reject,
            resolve
          );
        });
        await new Promise((resolve, reject) => {
          db.transaction(
            (tx) => {
              const nop = () => {};
              const onError = (tx, error) => reject(error);
              tx.executeSql('PRAGMA foreign_keys=on;', [], nop, onError);
              tx.executeSql(
                'DELETE FROM Users WHERE name=?',
                ['name1'],
                (tx, results) => {
                  t.expect(results.rowsAffected).toEqual(1);
                },
                onError
              );
              tx.executeSql(
                'DELETE FROM Users WHERE name=? OR name=?',
                ['name2', 'name3'],
                (tx, results) => {
                  t.expect(results.rowsAffected).toEqual(2);
                },
                onError
              );

              tx.executeSql(
                // ensure deletion succeeded
                'SELECT * from Users',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(0);
                },
                onError
              );

              tx.executeSql(
                'SELECT * from Posts',
                [],
                (tx, results) => {
                  t.expect(results.rows.length).toEqual(0);
                },
                onError
              );
              tx.executeSql('PRAGMA foreign_keys=off;', [], nop, onError);
            },
            reject,
            resolve
          );
        });
      });
    }
  });
}
