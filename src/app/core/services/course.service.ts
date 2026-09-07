import { Injectable } from '@angular/core';
import { Observable, delay, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { mapTeacherAssignmentToCourse } from '../api/mappers/teacher-assignment.mapper';
import { Course } from '../models/course.model';
import { MOCK_COURSES } from '../mocks/course.mock';
import { GroupService } from './group.service';
import { TeacherService } from './teacher.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(
    private teacherService: TeacherService,
    private groupService: GroupService
  ) {}

  getTeacherCourses(): Observable<Course[]> {
    if (environment.useFrontendMocks) {
      return of(MOCK_COURSES).pipe(delay(400));
    }

    return forkJoin({
      assignments: this.teacherService.getCurrentTeacherAssignments(),
      groups: this.groupService.getAllGroups(),
    }).pipe(
      map(({ assignments, groups }) => {
        const groupsById = new Map(groups.map((group) => [group.id, group]));

        return assignments.datos.map((assignment, index) =>
          mapTeacherAssignmentToCourse(
            assignment,
            groupsById.get(assignment.idGrupo),
            index
          )
        );
      })
    );
  }
}
